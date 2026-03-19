import { createClient } from './client';

/**
 * Uploads a file to Supabase Storage and returns the public URL.
 * @param file The file to upload
 * @param bucket The storage bucket name (default: 'inventory')
 * @param path The path within the bucket (default: organization_id/inventory/filename)
 */
export const uploadImage = async (
  file: File,
  bucket: string = 'inventory',
  path?: string
): Promise<string | null> => {
  try {
    const supabase = createClient();
    if (!supabase) return null;

    // Generate a unique filename if path is not provided
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = path ? `${path}/${fileName}` : `uploads/${fileName}`;

    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error.message);
      return null;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (err) {
    console.error('Unexpected error in uploadImage:', err);
    return null;
  }
};
