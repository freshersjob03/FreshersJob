// This file used to create a real Base44 SDK client. For local
// development without the Base44 backend we provide a lightweight stub that
// satisfies the same interface but returns empty data and no-ops.

import { supabase } from './supabaseClient';

// small helper to apply order strings like '-created_date' or 'name'
function normalizeOrder(order) {
  if (!order) return order;
  const descending = order.startsWith('-');
  const col = descending ? order.slice(1) : order;
  const normalizedCol = col === 'created_date' ? 'created_at' : col;
  return descending ? `-${normalizedCol}` : normalizedCol;
}

function applyOrder(query, order) {
  const normalized = normalizeOrder(order);
  if (!normalized) return query;
  const ascending = !normalized.startsWith('-');
  const col = ascending ? normalized : normalized.slice(1);
  return query.order(col, { ascending });
}

function sanitizeFileName(name) {
  return String(name || 'file')
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-');
}

function getFileExt(name) {
  const idx = name.lastIndexOf('.');
  return idx > -1 ? name.slice(idx + 1).toLowerCase() : 'bin';
}

function isMissingTableError(error) {
  const msg = String(error?.message || '').toLowerCase();
  return (
    msg.includes('could not find the table') ||
    (msg.includes('relation') && msg.includes('does not exist'))
  );
}

function isMissingColumnError(error, columnName) {
  const msg = String(error?.message || '').toLowerCase();
  const full = String(columnName).toLowerCase();
  const short = full.includes('.') ? full.split('.').pop() : full;
  return (
    (msg.includes(`column ${full}`) && msg.includes('does not exist')) ||
    (msg.includes('column') && msg.includes(short) && msg.includes('does not exist')) ||
    (msg.includes('could not find the') && msg.includes('column') && msg.includes(short))
  );
}

function getMissingColumnName(error) {
  const msg = String(error?.message || '').toLowerCase();
  const matchA = msg.match(/column\s+["']?([a-z0-9_.]+)["']?\s+(does not exist|was not found)/i);
  const matchB = msg.match(/could not find the\s+["']?([a-z0-9_.]+)["']?\s+column/i);
  const raw = matchA?.[1] || matchB?.[1] || null;
  if (raw) {
    const col = raw.toLowerCase();
    return col.includes('.') ? col.split('.').pop() : col;
  }
  return null;
}

function isMissingBucketError(error) {
  const msg = String(error?.message || '').toLowerCase();
  return msg.includes('bucket') && (msg.includes('not found') || msg.includes('does not exist'));
}

function isUnsupportedMimeTypeError(error) {
  const msg = String(error?.message || '').toLowerCase();
  return msg.includes('mime type') && msg.includes('not supported');
}

function canUseLocalBackend() {
  if (typeof window === 'undefined') return false;
  const host = String(window.location?.hostname || '').toLowerCase();
  return host === 'localhost' || host === '127.0.0.1';
}

async function runWithOrderFallback(buildQuery, order) {
  const normalized = normalizeOrder(order);
  let query = buildQuery(normalized);
  let { data, error } = await query;
  if (!error) return data || [];

  const orderCol = normalized ? (normalized.startsWith('-') ? normalized.slice(1) : normalized) : null;
  if (orderCol && isMissingColumnError(error, orderCol)) {
    query = buildQuery(null);
    ({ data, error } = await query);
    if (!error) return data || [];
  }

  throw error;
}

async function withTableFallback(tableNames, op) {
  let lastMissingError = null;
  for (const tableName of tableNames) {
    try {
      return await op(tableName);
    } catch (error) {
      if (isMissingTableError(error)) {
        lastMissingError = error;
        continue;
      }
      throw error;
    }
  }
  if (lastMissingError) throw lastMissingError;
  throw new Error('No table names configured for fallback');
}

export const api = {
  auth: {
    // This object was originally a Base44 helper.  When you enable a real
    // auth provider (Clerk in the UI, Supabase on the backend, etc.) you
    // should replace these with calls that read the current user and/or
    // token.  e.g.:
    //
    //   import { useAuth } from '../lib/AuthContext';
    //   const { user, getToken, signOut } = useAuth();
    //
    //   api.auth.me = () => user;
    //   api.auth.isAuthenticated = () => !!user;
    //   api.auth.redirectToLogin = (url) => navigateToLogin(url);
    //   api.auth.logout = signOut;
    //
    // On the server side you can grab a Clerk or Supabase session using the
    // appropriate SDK and expose helper endpoints instead.
    me: async () => {
      const clerk = window?.Clerk;
      const user = clerk?.user;
      if (!user) {
        throw new Error('Not authenticated');
      }

      const primaryEmail =
        user?.primaryEmailAddress?.emailAddress ||
        user?.emailAddresses?.[0]?.emailAddress ||
        null;

      const fullName =
        [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
        user?.username ||
        primaryEmail ||
        'User';

      return {
        id: user.id,
        email: primaryEmail,
        full_name: fullName,
        name: fullName,
      };
    },
    isAuthenticated: async () => {
      const clerk = window?.Clerk;
      return !!clerk?.user;
    },
    redirectToLogin: (url) => {
      const clerk = window?.Clerk;
      if (clerk?.openSignIn) {
        clerk.openSignIn({ redirectUrl: url });
      }
    },
    logout: async () => {
      const clerk = window?.Clerk;
      if (clerk?.signOut) {
        await clerk.signOut();
      }
    }
  },
  entities: {
    UserProfile: {
      filter: async (filterObj = {}) => {
        return withTableFallback(['UserProfile', 'userprofile'], async (tableName) => {
          let query = supabase.from(tableName).select('*');
          if (Object.keys(filterObj).length) {
            query = query.match(filterObj);
          }
          const { data, error } = await query;
          if (error) throw error;
          return data || [];
        });
      },
      create: async (obj) => {
        return withTableFallback(['UserProfile', 'userprofile'], async (tableName) => {
          const { data, error } = await supabase.from(tableName).insert(obj).select().single();
          if (error) throw error;
          return data;
        });
      },
      update: async (id, obj) => {
        return withTableFallback(['UserProfile', 'userprofile'], async (tableName) => {
          const { data, error } = await supabase.from(tableName).update(obj).eq('id', id).select().single();
          if (error) throw error;
          return data;
        });
      },
      delete: async (id) => {
        return withTableFallback(['UserProfile', 'userprofile'], async (tableName) => {
          const { error } = await supabase.from(tableName).delete().eq('id', id);
          if (error) throw error;
        });
      },
    },
    Job: {
      filter: async (filterObj = {}, order) => {
        const normalizedOrder = normalizeOrder(order);
        try {
          if (!canUseLocalBackend()) throw new Error('Local backend disabled');
          const params = new URLSearchParams();
          
          // Add filter parameters
          Object.entries(filterObj).forEach(([key, value]) => {
            if (value) params.append(key, value);
          });
          
          // Add order parameter
          if (normalizedOrder) {
            params.append('order', normalizedOrder);
          }
          
          const response = await fetch(`http://localhost:5000/api/jobs?${params}`);
          if (!response.ok) throw new Error('Failed to fetch jobs');
          
          const jobs = await response.json();
          return Array.isArray(jobs) ? jobs : jobs.data || [];
        } catch (error) {
          try {
            const loadFromSupabase = async (fallbackOrder) => {
              let query = supabase.from('jobs').select('*');
              if (Object.keys(filterObj).length) {
                query = query.match(filterObj);
              }
              query = applyOrder(query, fallbackOrder);
              return query;
            };
            return await runWithOrderFallback(loadFromSupabase, normalizedOrder);
          } catch (fallbackError) {
            console.error('Job fetch error:', fallbackError);
            throw fallbackError;
          }
        }
      },
      list: async (order, limit) => {
        const normalizedOrder = normalizeOrder(order);
        try {
          if (!canUseLocalBackend()) throw new Error('Local backend disabled');
          const params = new URLSearchParams();
          
          if (normalizedOrder) params.append('order', normalizedOrder);
          if (limit) params.append('limit', limit);
          
          const response = await fetch(`http://localhost:5000/api/jobs?${params}`);
          if (!response.ok) throw new Error('Failed to fetch jobs');
          
          const jobs = await response.json();
          return Array.isArray(jobs) ? jobs : jobs.data || [];
        } catch (error) {
          try {
            const loadFromSupabase = async (fallbackOrder) => {
              let query = supabase.from('jobs').select('*');
              query = applyOrder(query, fallbackOrder);
              if (limit) query = query.limit(Number(limit));
              return query;
            };
            return await runWithOrderFallback(loadFromSupabase, normalizedOrder);
          } catch (fallbackError) {
            console.error('Job list error:', fallbackError);
            throw fallbackError;
          }
        }
      },
      create: async (obj) => {
        const payload = {
          ...obj,
          company_name: obj?.company_name || obj?.company || null,
          company: obj?.company || obj?.company_name || null,
        };

        try {
          if (!canUseLocalBackend()) throw new Error('Local backend disabled');
          const response = await fetch('http://localhost:5000/api/jobs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create job');
          }
          
          const result = await response.json();
          return result.job;
        } catch (error) {
          // Production often has no local Express backend. Fallback to Supabase.
          try {
            const { data, error: insertError } = await supabase
              .from('jobs')
              .insert(payload)
              .select()
              .single();
            if (insertError) throw insertError;
            return data;
          } catch (fallbackError) {
            console.error('Job create error:', fallbackError);
            throw fallbackError;
          }
        }
      },
      update: async (id, obj) => {
        try {
          if (!canUseLocalBackend()) throw new Error('Local backend disabled');
          const response = await fetch(`http://localhost:5000/api/jobs/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(obj || {}),
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to update job');
          }

          const result = await response.json();
          return result.job || result;
        } catch (error) {
          try {
            const { data, error: updateError } = await supabase
              .from('jobs')
              .update(obj || {})
              .eq('id', id)
              .select()
              .single();
            if (updateError) throw updateError;
            return data;
          } catch (fallbackError) {
            console.error('Job update error:', fallbackError);
            throw fallbackError;
          }
        }
      },
      delete: async (id) => {
        try {
          if (!canUseLocalBackend()) throw new Error('Local backend disabled');
          const response = await fetch(`http://localhost:5000/api/jobs/${id}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete job');
          }
          
          return true;
        } catch (error) {
          try {
            const { error: deleteError } = await supabase.from('jobs').delete().eq('id', id);
            if (deleteError) throw deleteError;
            return true;
          } catch (fallbackError) {
            console.error('Job delete error:', fallbackError);
            throw fallbackError;
          }
        }
      }
    },
    Application: {
      filter: async (filterObj = {}, order) => {
        return withTableFallback(['applications', 'application', 'Application'], async (tableName) => {
          const runFilter = async (filters) => {
            let query = supabase.from(tableName).select('*');
            if (Object.keys(filters).length) {
              query = query.match(filters);
            }
            query = applyOrder(query, order);
            const { data, error } = await query;
            if (error) throw error;
            return data || [];
          };

          try {
            return await runFilter(filterObj);
          } catch (error) {
            if (filterObj?.candidate_email && isMissingColumnError(error, 'applications.candidate_email')) {
              const { candidate_email, ...rest } = filterObj;
              return runFilter({ ...rest, candidate_id: candidate_email });
            }
            throw error;
          }
        });
      },
      create: async (obj) => {
        return withTableFallback(['applications', 'application', 'Application'], async (tableName) => {
          const runCreate = async (payload) => {
            const { data, error } = await supabase.from(tableName).insert(payload).select().single();
            if (error) throw error;
            return data;
          };

          let payload = { ...obj };
          try {
            return await runCreate(payload);
          } catch (error) {
            if (payload?.candidate_email && isMissingColumnError(error, 'applications.candidate_email')) {
              const { candidate_email, ...rest } = payload;
              payload = { ...rest, candidate_id: candidate_email };
            } else {
              throw error;
            }
          }

          // Retry by removing extra fields unknown to this schema.
          // Some projects keep a minimal applications table, so we may need
          // to remove multiple optional fields one-by-one.
          const maxAttempts = Math.max(8, Object.keys(payload).length + 2);
          for (let i = 0; i < maxAttempts; i += 1) {
            try {
              return await runCreate(payload);
            } catch (retryError) {
              const missingCol = getMissingColumnName(retryError);
              if (!missingCol || !(missingCol in payload)) {
                throw retryError;
              }
              const next = { ...payload };
              delete next[missingCol];
              payload = next;
            }
          }

          return runCreate(payload);
        });
      },
      update: async (id, obj) => {
        return withTableFallback(['applications', 'application', 'Application'], async (tableName) => {
          const { data, error } = await supabase.from(tableName).update(obj).eq('id', id).select().single();
          if (error) throw error;
          return data;
        });
      },
      delete: async (id) => {
        return withTableFallback(['applications', 'application', 'Application'], async (tableName) => {
          const { error } = await supabase.from(tableName).delete().eq('id', id);
          if (error) throw error;
        });
      }
    },
    SavedJob: {
      filter: async (filterObj = {}) => {
        return withTableFallback(['saved_jobs', 'savedjob', 'SavedJob'], async (tableName) => {
          const runFilter = async (filters) => {
            let query = supabase.from(tableName).select('*');
            if (Object.keys(filters).length) {
              query = query.match(filters);
            }
            const { data, error } = await query;
            if (error) throw error;
            return data || [];
          };

          try {
            const direct = await runFilter(filterObj);
            if (direct.length > 0) return direct;

            // If both identifiers are present, try each one individually as fallback.
            if (filterObj?.user_email && filterObj?.user_id) {
              const { user_id, ...emailOnly } = filterObj;
              const emailRows = await runFilter(emailOnly);
              if (emailRows.length > 0) return emailRows;

              const { user_email, ...idOnlyRest } = filterObj;
              return runFilter({ ...idOnlyRest, user_id });
            }

            return direct;
          } catch (error) {
            if (filterObj?.user_email && isMissingColumnError(error, 'saved_jobs.user_email')) {
              const { user_email, ...rest } = filterObj;
              return runFilter({ ...rest, user_id: filterObj?.user_id || user_email });
            }
            if (filterObj?.user_id && isMissingColumnError(error, 'saved_jobs.user_id')) {
              const { user_id, ...rest } = filterObj;
              return runFilter(rest);
            }
            throw error;
          }
        });
      },
      create: async (obj) => {
        return withTableFallback(['saved_jobs', 'savedjob', 'SavedJob'], async (tableName) => {
          const runCreate = async (payload) => {
            const { data, error } = await supabase.from(tableName).insert(payload).select().single();
            if (error) throw error;
            return data;
          };

          try {
            return await runCreate(obj);
          } catch (error) {
            if (obj?.user_email && isMissingColumnError(error, 'saved_jobs.user_email')) {
              const { user_email, ...rest } = obj;
              return runCreate({ ...rest, user_id: obj?.user_id || user_email });
            }
            if (obj?.user_id && isMissingColumnError(error, 'saved_jobs.user_id')) {
              const { user_id, ...rest } = obj;
              return runCreate(rest);
            }
            throw error;
          }
        });
      },
      delete: async (id) => {
        return withTableFallback(['saved_jobs', 'savedjob', 'SavedJob'], async (tableName) => {
          const { error } = await supabase.from(tableName).delete().eq('id', id);
          if (error) throw error;
        });
      }
    }
  },
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        if (!file) {
          throw new Error('No file provided');
        }

        const ext = getFileExt(file.name || '');
        const base = sanitizeFileName((file.name || 'file').replace(/\.[^/.]+$/, ''));
        const isImage = file.type?.startsWith('image/');
        const configuredBucket = isImage
          ? import.meta.env.VITE_SUPABASE_PROFILE_BUCKET
          : import.meta.env.VITE_SUPABASE_RESUME_BUCKET;
        const bucketCandidates = Array.from(
          new Set(
            [
              configuredBucket,
              isImage ? 'Profilephoto' : 'Resume',
              isImage ? 'profilephoto' : 'resume',
            ].filter(Boolean)
          )
        );
        const folder = isImage ? 'images' : 'files';
        const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${base}.${ext}`;

        let uploadedBucket = null;
        let lastError = null;
        for (const bucket of bucketCandidates) {
          const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(path, file, { upsert: false, cacheControl: '3600' });

          if (!uploadError) {
            uploadedBucket = bucket;
            break;
          }
          lastError = uploadError;
          // Try the next candidate bucket for missing-bucket and mime-restriction errors.
          if (!isMissingBucketError(uploadError) && !isUnsupportedMimeTypeError(uploadError)) {
            break;
          }
        }

        if (!uploadedBucket) {
          if (isUnsupportedMimeTypeError(lastError)) {
            throw new Error(
              'Resume bucket does not allow this file type. In Supabase Storage, allow MIME types: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document.'
            );
          }
          throw new Error(lastError?.message || 'Upload failed. Storage bucket missing or blocked by policy.');
        }

        const { data } = supabase.storage.from(uploadedBucket).getPublicUrl(path);
        if (!data?.publicUrl) {
          throw new Error('Failed to generate file URL');
        }

        return { file_url: data.publicUrl };
      }
    }
  },
  appLogs: {
    logUserInApp: async (pageName) => {
      console.log('logUserInApp', pageName);
    }
  }
};
