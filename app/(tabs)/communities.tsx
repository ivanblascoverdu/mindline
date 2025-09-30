import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Shield, UserPlus, UserMinus } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import {
  COMMUNITIES_QUERY_KEY,
  createCommunity,
  fetchCommunities,
  joinCommunity,
  leaveCommunity,
} from '@/services/communities';
import { Community, CommunityInput } from '@/types/social';

type CommunityCardProps = {
  community: Community;
  onJoin: (communityId: string) => void;
  onLeave: (communityId: string) => void;
  isProcessing: boolean;
};

const CommunityCard = ({ community, onJoin, onLeave, isProcessing }: CommunityCardProps) => {
  const handlePress = () => {
    if (isProcessing) return;
    if (community.isMember) {
      onLeave(community.id);
    } else {
      onJoin(community.id);
    }
  };

  return (
    <View style={styles.communityCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.communityName}>{community.name}</Text>
        <View style={styles.focusBadge}>
          <Shield size={14} color={Colors.light.tint} />
          <Text style={styles.focusBadgeText}>{community.focusArea}</Text>
        </View>
      </View>

      {community.description ? (
        <Text style={styles.communityDescription}>{community.description}</Text>
      ) : null}

      <View style={styles.cardFooter}>
        <View style={styles.memberCount}>
          <Users size={16} color={Colors.light.tabIconDefault} />
          <Text style={styles.memberCountText}>{community.memberCount} miembros</Text>
        </View>
        <TouchableOpacity
          style={[styles.joinButton, community.isMember ? styles.leaveButton : styles.primaryButton]}
          onPress={handlePress}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color={community.isMember ? Colors.light.tint : '#fff'} />
          ) : community.isMember ? (
            <>
              <UserMinus size={16} color={Colors.light.tint} />
              <Text style={[styles.joinButtonText, styles.leaveButtonText]}>Salir</Text>
            </>
          ) : (
            <>
              <UserPlus size={16} color="#fff" />
              <Text style={styles.joinButtonText}>Unirme</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function CommunitiesScreen() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [focusArea, setFocusArea] = useState('Apoyo emocional');
  const [isPrivate, setIsPrivate] = useState(false);

  const communitiesQuery = useQuery({
    queryKey: COMMUNITIES_QUERY_KEY,
    queryFn: () => fetchCommunities(user!.id),
    enabled: Boolean(user?.id),
  });

  const createMutation = useMutation({
    mutationFn: (input: CommunityInput) => createCommunity(user!.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMUNITIES_QUERY_KEY });
      setName('');
      setDescription('');
      setFocusArea('Apoyo emocional');
      setIsPrivate(false);
    },
    onError: error => {
      Alert.alert('No pudimos crear la comunidad', error instanceof Error ? error.message : 'Intenta de nuevo');
    },
  });

  const joinMutation = useMutation({
    mutationFn: (communityId: string) => joinCommunity(user!.id, communityId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: COMMUNITIES_QUERY_KEY }),
    onError: error => {
      Alert.alert('No pudimos unirnos', error instanceof Error ? error.message : 'Intenta mas tarde');
    },
  });

  const leaveMutation = useMutation({
    mutationFn: (communityId: string) => leaveCommunity(user!.id, communityId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: COMMUNITIES_QUERY_KEY }),
    onError: error => {
      Alert.alert('No pudimos salir', error instanceof Error ? error.message : 'Intenta mas tarde');
    },
  });

  const handleCreateCommunity = () => {
    if (!name.trim()) {
      Alert.alert('Anade un nombre a tu comunidad');
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      focusArea: focusArea.trim() || 'General',
      isPrivate,
    });
  };

  const renderCommunity = ({ item }: { item: Community }) => (
    <CommunityCard
      community={item}
      onJoin={joinMutation.mutate}
      onLeave={leaveMutation.mutate}
      isProcessing={joinMutation.isPending || leaveMutation.isPending}
    />
  );

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Inicia sesion para descubrir comunidades.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.createCard}>
        <View style={styles.createHeader}>
          <View style={styles.headerIcon}>
            <Plus size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.createTitle}>Crea una comunidad</Text>
            <Text style={styles.createSubtitle}>
              Reune a personas con retos similares para apoyarse mutuamente.
            </Text>
          </View>
        </View>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Nombre de la comunidad"
          placeholderTextColor={Colors.light.tabIconDefault}
          style={styles.input}
        />
        <TextInput
          value={focusArea}
          onChangeText={setFocusArea}
          placeholder="Area de enfoque (ansiedad, depresion, burnout, etc.)"
          placeholderTextColor={Colors.light.tabIconDefault}
          style={styles.input}
        />
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Describe como apoyara esta comunidad"
          placeholderTextColor={Colors.light.tabIconDefault}
          style={[styles.input, styles.textArea]}
          multiline
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Hacer privada</Text>
          <Switch
            value={isPrivate}
            onValueChange={setIsPrivate}
            trackColor={{ false: Colors.light.border, true: Colors.light.tint }}
            thumbColor="#fff"
          />
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, (createMutation.isPending || !name.trim()) && styles.disabledButton]}
          onPress={handleCreateCommunity}
          disabled={createMutation.isPending || !name.trim()}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Crear comunidad</Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={communitiesQuery.data ?? []}
        keyExtractor={item => item.id}
        renderItem={renderCommunity}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          communitiesQuery.isLoading ? (
            <View style={styles.placeholder}>
              <ActivityIndicator size="large" color={Colors.light.tint} />
              <Text style={styles.placeholderText}>Cargando comunidades...</Text>
            </View>
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderTitle}>Todavia no hay comunidades</Text>
              <Text style={styles.placeholderText}>
                Crea la primera para que otros usuarios puedan unirse.
              </Text>
            </View>
          )
        }
        refreshing={communitiesQuery.isRefetching}
        onRefresh={() => communitiesQuery.refetch()}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  createCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 24,
  },
  createHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.light.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  createSubtitle: {
    fontSize: 13,
    color: Colors.light.tabIconDefault,
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.light.text,
    backgroundColor: Colors.light.background,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchLabel: {
    fontSize: 15,
    color: Colors.light.text,
    fontWeight: '600',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    borderRadius: 14,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  listContent: {
    paddingBottom: 40,
  },
  communityCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  communityName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    flex: 1,
    paddingRight: 12,
  },
  focusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
  },
  focusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  communityDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberCountText: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  leaveButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.light.tint,
  },
  leaveButtonText: {
    color: Colors.light.tint,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});
