import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Users, Lock } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { createAchievement, fetchAchievements, ACHIEVEMENTS_QUERY_KEY } from '@/services/achievements';
import { Achievement, AchievementMood, AchievementVisibility } from '@/types/social';

const moodOptions: { value: AchievementMood; label: string; description: string; color: string }[] = [
  { value: 'celebration', label: 'Celebracion', description: 'Grandes logros que te llenan de orgullo', color: '#f97316' },
  { value: 'progress', label: 'Progreso', description: 'Pequenos pasos que suman cada dia', color: '#10b981' },
  { value: 'gratitude', label: 'Gratitud', description: 'Momentos por los que estas agradecido/a', color: '#6366f1' },
  { value: 'struggle', label: 'Aprendizajes', description: 'Retos o recaidas que te ensenaron algo', color: '#f59e0b' },
];

const visibilityOptions: { value: AchievementVisibility; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'public',
    label: 'Comunidad global',
    description: 'Comparte tu logro con todos los miembros de Mindline',
    icon: <Sparkles size={18} color={Colors.light.tint} />,
  },
  {
    value: 'community',
    label: 'Mis comunidades',
    description: 'Solo las comunidades a las que perteneces podran verlo',
    icon: <Users size={18} color={Colors.light.tabIconDefault} />,
  },
];

const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
  const moodMeta = moodOptions.find(option => option.value === achievement.mood);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          {achievement.userAvatar ? (
            <Image source={{ uri: achievement.userAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarFallback}>{achievement.userName.slice(0, 1).toUpperCase()}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerText}>
          <Text style={styles.userName}>{achievement.userName}</Text>
          <Text style={styles.timestamp}>{new Date(achievement.createdAt).toLocaleString()}</Text>
        </View>
        <View style={[styles.moodBadge, { backgroundColor: `${moodMeta?.color ?? Colors.light.tint}20` }] }>
          <Text style={[styles.moodBadgeText, { color: moodMeta?.color ?? Colors.light.tint }]}>
            {moodMeta?.label ?? 'Progreso'}
          </Text>
        </View>
      </View>

      <Text style={styles.cardTitle}>{achievement.title}</Text>
      {achievement.description ? <Text style={styles.cardDescription}>{achievement.description}</Text> : null}

      <View style={styles.cardFooter}>
        <View style={styles.footerStat}>
          <Sparkles size={16} color={Colors.light.tabIconDefault} />
          <Text style={styles.footerStatText}>{achievement.likesCount} reconocimientos</Text>
        </View>
        <View style={styles.footerStat}>
          <Users size={16} color={Colors.light.tabIconDefault} />
          <Text style={styles.footerStatText}>{achievement.commentsCount} comentarios</Text>
        </View>
        {achievement.visibility === 'community' ? (
          <View style={styles.footerStat}>
            <Lock size={16} color={Colors.light.tabIconDefault} />
            <Text style={styles.footerStatText}>Solo comunidades</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

export default function AchievementsScreen() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMood, setSelectedMood] = useState<AchievementMood>('progress');
  const [visibility, setVisibility] = useState<AchievementVisibility>('public');

  const achievementsQuery = useQuery({
    queryKey: ACHIEVEMENTS_QUERY_KEY,
    queryFn: fetchAchievements,
    enabled: isAuthenticated,
  });

  const publishMutation = useMutation({
    mutationFn: (payload: { title: string; description?: string; mood: AchievementMood; visibility: AchievementVisibility }) => {
      if (!user) {
        throw new Error('Debes iniciar sesion para publicar.');
      }
      return createAchievement(user.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACHIEVEMENTS_QUERY_KEY });
      setTitle('');
      setDescription('');
      setSelectedMood('progress');
      setVisibility('public');
    },
    onError: error => {
      Alert.alert('No pudimos publicar tu logro', error instanceof Error ? error.message : 'Intentalo nuevamente');
    },
  });

  const handlePublish = () => {
    if (!title.trim()) {
      Alert.alert('Escribe un titulo para tu logro');
      return;
    }

    publishMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      mood: selectedMood,
      visibility,
    });
  };

  const content = useMemo(() => {
    if (achievementsQuery.isLoading) {
      return (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.loaderText}>Cargando logros de la comunidad...</Text>
        </View>
      );
    }

    if (achievementsQuery.isError) {
      return (
        <View style={styles.loader}>
          <Text style={styles.errorText}>
            No pudimos cargar los logros. Desliza hacia abajo para reintentar.
          </Text>
        </View>
      );
    }

    const data = achievementsQuery.data ?? [];

    return (
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={achievementsQuery.isRefetching}
            onRefresh={() => achievementsQuery.refetch()}
            colors={[Colors.light.tint]}
          />
        }
        renderItem={({ item }) => <AchievementCard achievement={item} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Sparkles size={40} color={Colors.light.tabIconDefault} />
            <Text style={styles.emptyTitle}>Aun no hay logros</Text>
            <Text style={styles.emptySubtitle}>
              Se la primera persona en compartir un progreso y motiva a la comunidad.
            </Text>
          </View>
        )}
      />
    );
  }, [achievementsQuery]);

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>Inicia sesion para ver y compartir tus logros.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.publishContainer}
        contentContainerStyle={styles.publishContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Comparte tu progreso</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="?Que lograste hoy?"
          placeholderTextColor={Colors.light.tabIconDefault}
          style={styles.titleInput}
        />
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Cuenta un poco mas sobre como te sientes"
          placeholderTextColor={Colors.light.tabIconDefault}
          style={styles.descriptionInput}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>?Como describirias este logro?</Text>
        <View style={styles.optionsRow}>
          {moodOptions.map(option => {
            const isSelected = option.value === selectedMood;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.optionPill, isSelected && { borderColor: option.color, backgroundColor: `${option.color}15` }]}
                onPress={() => setSelectedMood(option.value)}
              >
                <View style={styles.optionHeader}>
                  <View style={[styles.optionDot, { backgroundColor: option.color }]} />
                  <Text style={[styles.optionTitle, isSelected && { color: option.color }]}>{option.label}</Text>
                </View>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>?Quien puede verlo?</Text>
        <View style={styles.visibilityContainer}>
          {visibilityOptions.map(option => {
            const isSelected = visibility === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.visibilityCard, isSelected && styles.visibilityCardSelected]}
                onPress={() => setVisibility(option.value)}
              >
                <View style={styles.visibilityHeader}>
                  {option.icon}
                  <Text style={[styles.visibilityTitle, isSelected && { color: Colors.light.tint }]}>{option.label}</Text>
                </View>
                <Text style={styles.visibilityDescription}>{option.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.publishButton, (!title.trim() || publishMutation.isPending) && styles.publishButtonDisabled]}
          onPress={handlePublish}
          disabled={!title.trim() || publishMutation.isPending}
        >
          {publishMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.publishButtonText}>Publicar logro</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.feedContainer}>{content}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  publishContainer: {
    maxHeight: 360,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  publishContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.light.text,
    backgroundColor: Colors.light.backgroundSecondary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.tabIconDefault,
    textTransform: 'uppercase',
  },
  optionsRow: {
    flexDirection: 'column',
    gap: 12,
  },
  optionPill: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#fff',
    gap: 6,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  optionDescription: {
    fontSize: 13,
    color: Colors.light.tabIconDefault,
  },
  visibilityContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  visibilityCard: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#fff',
    gap: 8,
  },
  visibilityCardSelected: {
    borderColor: Colors.light.tint,
    backgroundColor: '#eef2ff',
  },
  visibilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  visibilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  visibilityDescription: {
    fontSize: 13,
    color: Colors.light.tabIconDefault,
  },
  publishButton: {
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: Colors.light.tint,
  },
  publishButtonDisabled: {
    opacity: 0.6,
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  feedContainer: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallback: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  headerText: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  moodBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  moodBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  cardDescription: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  footerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerStatText: {
    fontSize: 13,
    color: Colors.light.tabIconDefault,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  loaderText: {
    fontSize: 15,
    color: Colors.light.tabIconDefault,
  },
  errorText: {
    fontSize: 15,
    color: Colors.error,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
});



