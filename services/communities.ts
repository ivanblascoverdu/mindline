import { supabase } from '@/lib/supabase';
import { Community, CommunityInput } from '@/types/social';

const communityFields = 'id, name, description, focus_area, is_private, owner_id, created_at';

const mapCommunity = (
  row: any,
  membershipMap: Map<string, { count: number; isMember: boolean }>,
): Community => {
  const metadata = membershipMap.get(row.id) ?? { count: 0, isMember: false };
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    focusArea: row.focus_area ?? 'General',
    ownerId: row.owner_id,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    memberCount: metadata.count,
    isMember: metadata.isMember,
  };
};

export const COMMUNITIES_QUERY_KEY = ['communities'];

export async function fetchCommunities(userId: string): Promise<Community[]> {
  const { data: rawCommunities, error } = await supabase
    .from('communities')
    .select(communityFields)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  if (!rawCommunities || rawCommunities.length === 0) {
    return [];
  }

  const communityIds = rawCommunities.map(community => community.id);

  const { data: memberRows, error: membersError } = await supabase
    .from('community_members')
    .select('community_id, user_id')
    .in('community_id', communityIds);

  if (membersError) {
    throw new Error(membersError.message);
  }

  const membershipMap = new Map<string, { count: number; isMember: boolean }>();

  memberRows?.forEach(member => {
    const current = membershipMap.get(member.community_id) ?? { count: 0, isMember: false };
    membershipMap.set(member.community_id, {
      count: current.count + 1,
      isMember: current.isMember || member.user_id === userId,
    });
  });

  return rawCommunities.map(row => mapCommunity(row, membershipMap));
}

export async function createCommunity(userId: string, payload: CommunityInput): Promise<Community> {
  const { data, error } = await supabase
    .from('communities')
    .insert({
      name: payload.name,
      description: payload.description ?? null,
      focus_area: payload.focusArea,
      is_private: payload.isPrivate ?? false,
      owner_id: userId,
    })
    .select(communityFields)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'No se pudo crear la comunidad');
  }

  const { error: membershipError } = await supabase
    .from('community_members')
    .insert({
      community_id: data.id,
      user_id: userId,
      role: 'owner',
    });

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  return mapCommunity(data, new Map([[data.id, { count: 1, isMember: true }]]));
}

export async function joinCommunity(userId: string, communityId: string): Promise<void> {
  const { error } = await supabase
    .from('community_members')
    .insert({
      community_id: communityId,
      user_id: userId,
      role: 'member',
    });

  if (error) {
    throw new Error(error.message);
  }
}

export async function leaveCommunity(userId: string, communityId: string): Promise<void> {
  const { error } = await supabase
    .from('community_members')
    .delete()
    .eq('community_id', communityId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}

