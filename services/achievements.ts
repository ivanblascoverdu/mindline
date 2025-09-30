import { supabase } from '@/lib/supabase';
import { Achievement, NewAchievement } from '@/types/social';

const achievementSelection = `id, user_id, title, description, mood, visibility, likes_count, comments_count, created_at, profiles(full_name, avatar_url)`;

const mapAchievement = (row: any): Achievement => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  description: row.description ?? undefined,
  mood: (row.mood ?? 'progress') as Achievement['mood'],
  visibility: (row.visibility ?? 'public') as Achievement['visibility'],
  likesCount: row.likes_count ?? 0,
  commentsCount: row.comments_count ?? 0,
  createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  userName: row.profiles?.full_name ?? 'Miembro anonimo',
  userAvatar: row.profiles?.avatar_url ?? undefined,
});

export const ACHIEVEMENTS_QUERY_KEY = ['achievements'];

export async function fetchAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select(achievementSelection)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapAchievement);
}

export async function createAchievement(userId: string, payload: NewAchievement): Promise<Achievement> {
  const { data, error } = await supabase
    .from('achievements')
    .insert({
      user_id: userId,
      title: payload.title,
      description: payload.description ?? null,
      mood: payload.mood,
      visibility: payload.visibility,
    })
    .select(achievementSelection)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('No se pudo crear el logro.');
  }

  return mapAchievement(data);
}


