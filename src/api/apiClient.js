// This file used to create a real Base44 SDK client. For local
// development without the Base44 backend we provide a lightweight stub that
// satisfies the same interface but returns empty data and no-ops.

import { supabase } from './supabaseClient';

// small helper to apply order strings like '-created_date' or 'name'
function applyOrder(query, order) {
  if (!order) return query;
  const ascending = !order.startsWith('-');
  const col = ascending ? order : order.slice(1);
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
  return msg.includes('could not find the table') || msg.includes('schema cache');
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
    me: async () => ({ email: 'demo@local', name: 'Demo User' }),
    isAuthenticated: async () => true,
    redirectToLogin: (url) => { console.log('redirect to', url); },
    logout: () => { console.log('logout'); }
  },
  entities: {
    UserProfile: {
      filter: async (filterObj = {}) => {
        return withTableFallback(['userprofile', 'UserProfile'], async (tableName) => {
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
        return withTableFallback(['userprofile', 'UserProfile'], async (tableName) => {
          const { data, error } = await supabase.from(tableName).insert(obj).select().single();
          if (error) throw error;
          return data;
        });
      },
      update: async (id, obj) => {
        return withTableFallback(['userprofile', 'UserProfile'], async (tableName) => {
          const { data, error } = await supabase.from(tableName).update(obj).eq('id', id).select().single();
          if (error) throw error;
          return data;
        });
      },
      delete: async (id) => {
        return withTableFallback(['userprofile', 'UserProfile'], async (tableName) => {
          const { error } = await supabase.from(tableName).delete().eq('id', id);
          if (error) throw error;
        });
      },
    },
    Job: {
      filter: async (filterObj = {}, order) => {
        let query = supabase.from('Job').select('*');
        if (Object.keys(filterObj).length) {
          query = query.match(filterObj);
        }
        query = applyOrder(query, order);
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      },
      list: async (order, limit) => {
        let query = supabase.from('Job').select('*');
        query = applyOrder(query, order);
        if (limit) query = query.limit(limit);
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      },
      create: async (obj) => {
        const { data, error } = await supabase.from('Job').insert(obj).select().single();
        if (error) throw error;
        return data;
      },
      update: async (id, obj) => {
        const { data, error } = await supabase.from('Job').update(obj).eq('id', id).select().single();
        if (error) throw error;
        return data;
      },
      delete: async (id) => {
        const { error } = await supabase.from('Job').delete().eq('id', id);
        if (error) throw error;
      }
    },
    Application: {
      filter: async (filterObj = {}, order) => {
        let query = supabase.from('Application').select('*');
        if (Object.keys(filterObj).length) {
          query = query.match(filterObj);
        }
        query = applyOrder(query, order);
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      },
      update: async (id, obj) => {
        const { data, error } = await supabase.from('Application').update(obj).eq('id', id).select().single();
        if (error) throw error;
        return data;
      },
      delete: async (id) => {
        const { error } = await supabase.from('Application').delete().eq('id', id);
        if (error) throw error;
      }
    },
    SavedJob: {
      filter: async (filterObj = {}) => {
        let query = supabase.from('SavedJob').select('*');
        if (Object.keys(filterObj).length) {
          query = query.match(filterObj);
        }
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      },
      delete: async (id) => {
        const { error } = await supabase.from('SavedJob').delete().eq('id', id);
        if (error) throw error;
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
        const bucket = isImage
          ? (import.meta.env.VITE_SUPABASE_PROFILE_BUCKET || 'Profilephoto')
          : (import.meta.env.VITE_SUPABASE_RESUME_BUCKET || 'Resume');
        const folder = isImage ? 'images' : 'files';
        const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${base}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(path, file, { upsert: false, cacheControl: '3600' });

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
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
