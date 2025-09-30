import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Phone,
  Mail,
  Globe,
  Heart,
  MessageCircle,
  Shield,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Users,
  Bookmark,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import {
  emergencyContacts,
  professionalContacts,
} from './mocks/professional-help';
import { Community, CommunityInput } from '@/types/social';
import {
  ProfessionalContact,
  EmergencyContact,
} from '@/types/professional-help';
import {
  COMMUNITIES_QUERY_KEY,
  createCommunity,
  fetchCommunities,
  joinCommunity,
  leaveCommunity,
} from '@/services/communities';

const FILTERS = [
  { id: 'all', label: 'Todo' },
  { id: 'psychologist', label: 'Psicologia' },
  { id: 'therapist', label: 'Terapia' },
  { id: 'ngo', label: 'Organizaciones' },
  { id: 'crisis_line', label: 'Crisis' },
] as const;

type FilterType = (typeof FILTERS)[number]['id'];

type Story = {
  id: string;
  author: string;
  focus: string;
  title: string;
  summary: string;
  reactions: number;
  replies: number;
};

const COMMUNITY_STORIES: Story[] = [
  {
    id: 'story-1',
    author: 'Ana - Comunidad Ansiedad',
    focus: 'Mindfulness diario',
    title: 'Como la respiracion guiada cambio mis tardes',
    summary:
      'Comparto la rutina de cinco minutos que uso antes de reuniones para bajar el pulso y sentir control.',
    reactions: 86,
    replies: 14,
  },
  {
    id: 'story-2',
    author: 'Marc - Resiliencia',
    focus: 'Gestion del estres',
    title: 'Aprendi a pedir ayuda sin sentir culpa',
    summary:
      'Un hilo sobre identificar senales de agotamiento y como hablo con mi equipo cuando necesito una pausa.',
    reactions: 63,
    replies: 18,
  },
  {
    id: 'story-3',
    author: 'Laura - Comunidad Sueño',
    focus: 'Rutinas nocturnas',
    title: 'Checklist nocturna para dormir en 15 minutos',
    summary:
      'Incluye respiracion, ambiente y un mantra de despedida del dia para cerrar pendientes mentales.',
    reactions: 91,
    replies: 22,
  },
];

const QUICK_ACTIONS = [
  {
    id: 'create-room',
    icon: Sparkles,
    label: 'Crear sala segura',
    description: 'Organiza micro sesiones privadas con tu comunidad.',
    target: '/(tabs)/communities',
  },
  {
    id: 'share-experience',
    icon: MessageCircle,
    label: 'Compartir experiencia',
    description: 'Publica una vivencia para inspirar a otros miembros.',
    target: '/(tabs)/achievements',
  },
  {
    id: 'premium-guides',
    icon: Bookmark,
    label: 'Guias premium',
    description: 'Accede a cursos y contenidos exclusivos verificados.',
    target: '/(tabs)/courses',
  },
] as const;

const gradientStops = ['#4338CA', '#7C3AED', '#EC4899'] as const;

const availabilityColors: Record<string, string> = {
  available: '#16a34a',
  busy: '#f59e0b',
  offline: '#ef4444',
};

const formatAvailabilityLabel = (value: string) => {
  switch (value) {
    case 'available':
      return 'Disponible';
    case 'busy':
      return 'Agenda llena';
    default:
      return 'Consulta horarios';
  }
};

export default function ProfessionalHelpScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [communityName, setCommunityName] = useState('');
  const [communityFocus, setCommunityFocus] = useState('Apoyo emocional');

  const communitiesQuery = useQuery({
    queryKey: COMMUNITIES_QUERY_KEY,
    queryFn: () => fetchCommunities(user?.id ?? ''),
    enabled: Boolean(user?.id),
  });

  const createCommunityMutation = useMutation({
    mutationFn: (payload: CommunityInput) => {
      if (!user) {
        throw new Error('Debes iniciar sesion para crear comunidades.');
      }
      return createCommunity(user.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMUNITIES_QUERY_KEY });
      setCommunityName('');
      setCommunityFocus('Apoyo emocional');
      Alert.alert('Listo', 'Tu comunidad se publico y ya puede recibir miembros.');
    },
    onError: error => {
      Alert.alert('No pudimos crear la comunidad', error instanceof Error ? error.message : 'Intenta mas tarde.');
    },
  });

  const joinCommunityMutation = useMutation({
    mutationFn: (communityId: string) => {
      if (!user) {
        throw new Error('Necesitas una cuenta para unirte.');
      }
      return joinCommunity(user.id, communityId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: COMMUNITIES_QUERY_KEY }),
  });

  const leaveCommunityMutation = useMutation({
    mutationFn: (communityId: string) => {
      if (!user) {
        throw new Error('Necesitas una cuenta para salir de una comunidad.');
      }
      return leaveCommunity(user.id, communityId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: COMMUNITIES_QUERY_KEY }),
  });

  const filteredContacts = useMemo(() => {
    if (selectedFilter === 'all') return professionalContacts;
    return professionalContacts.filter(pro => pro.type === selectedFilter);
  }, [selectedFilter]);

  const handleCall = (phone: string) => Linking.openURL(`tel:${phone}`);
  const handleEmail = (email: string) => Linking.openURL(`mailto:${email}`);
  const handleWebsite = (website?: string) => {
    if (!website) return;
    Linking.openURL(website);
  };

  const handleEmergencyCall = (contact: EmergencyContact) => {
    Alert.alert(
      'Linea directa',
      `Llamar a ${contact.name}?\n\n${contact.description}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Llamar ahora', onPress: () => handleCall(contact.phone), style: 'destructive' },
      ],
    );
  };

  const handleStoryPress = (story: Story) => {
    if (!isAuthenticated) {
      Alert.alert('Necesitas iniciar sesion', 'Ingresa o crea una cuenta para comentar en historias.');
      return;
    }
    router.push('/(tabs)/communities');
  };

  const handleCreateCommunity = () => {
    if (!communityName.trim()) {
      Alert.alert('Escribe un nombre', 'Necesitamos un nombre corto para que otros encuentren tu comunidad.');
      return;
    }

    createCommunityMutation.mutate({
      name: communityName.trim(),
      focusArea: communityFocus.trim() || 'General',
      description: 'Espacio creado desde la seccion de ayuda profesional.',
    });
  };

  const isLoadingCommunities = communitiesQuery.isLoading || communitiesQuery.isRefetching;
  const myCommunities = communitiesQuery.data ?? [];

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top + 12 }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <LinearGradient colors={gradientStops} style={styles.heroCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.heroHeader}>
            <Text style={styles.heroTitle}>Apoyo profesional y comunidad</Text>
            <Text style={styles.heroSubtitle}>
              Conecta con especialistas validados y espacios seguros donde compartir avances y recaidas.
            </Text>
            <View style={styles.heroBadges}>
              <View style={styles.heroBadge}>
                <Shield size={16} color="#fff" />
                <Text style={styles.heroBadgeText}>Equipo verificado</Text>
              </View>
              <View style={styles.heroBadge}>
                <Heart size={16} color="#fff" />
                <Text style={styles.heroBadgeText}>Comunidad activa</Text>
              </View>
            </View>
          </View>
          <View style={styles.heroActions}>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/communities')}
              style={styles.primaryCta}
            >
              <Text style={styles.primaryCtaText}>Explorar comunidades</Text>
              <ArrowRight size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/achievements')}
              style={styles.secondaryCta}
            >
              <Text style={styles.secondaryCtaText}>Compartir logro</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contactos de emergencia</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emergencyRow}>
            {emergencyContacts.map(contact => (
              <TouchableOpacity
                key={contact.id}
                style={styles.emergencyCard}
                onPress={() => handleEmergencyCall(contact)}
                activeOpacity={0.9}
              >
                <View style={styles.emergencyHeader}>
                  <Shield size={20} color={Colors.light.tint} />
                  <View style={styles.emergencyInfo}>
                    <Text style={styles.emergencyName}>{contact.name}</Text>
                    <Text style={styles.emergencyPhone}>{contact.phone}</Text>
                  </View>
                </View>
                <Text style={styles.emergencyDescription}>{contact.description}</Text>
                <View style={styles.emergencyFooter}>
                  <Text style={styles.emergencyFooterText}>{contact.country}</Text>
                  {contact.available24h ? <Text style={styles.emergencyBadge}>24/7</Text> : null}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profesionales recomendados</Text>
            <TouchableOpacity onPress={() => setSelectedFilter('all')}>
              <Text style={styles.resetFilters}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {FILTERS.map(filter => {
              const isActive = selectedFilter === filter.id;
              return (
                <TouchableOpacity
                  key={filter.id}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setSelectedFilter(filter.id)}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {filteredContacts.map(contact => (
            <View key={contact.id} style={styles.proCard}>
              <View style={styles.proHeader}>
                {contact.image ? (
                  <Image
                    source={{ uri: contact.image }}
                    style={styles.proAvatar}
                  />
                ) : (
                  <View style={[styles.proAvatar, styles.proAvatarFallback]}>
                    <Users size={28} color={Colors.light.tabIconDefault} />
                  </View>
                )}
                <View style={styles.proInfo}>
                  <Text style={styles.proName}>{contact.name}</Text>
                  <Text style={styles.proTitle}>{contact.title}</Text>
                  <View style={styles.proMetaRow}>
                    <View style={styles.proMetaChip}>
                      <Text style={styles.proMetaText}>{contact.location}</Text>
                    </View>
                    {contact.rating ? (
                      <View style={styles.proMetaChip}>
                        <Heart size={14} color={Colors.light.tint} />
                        <Text style={styles.proMetaText}>{contact.rating.toFixed(1)} • {contact.reviewCount}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
                <View
                  style={[styles.availabilityTag, { backgroundColor: `${availabilityColors[contact.availability] ?? '#64748b'}30`, borderColor: availabilityColors[contact.availability] ?? '#64748b' }]}
                >
                  <Text
                    style={[styles.availabilityText, { color: availabilityColors[contact.availability] ?? '#64748b' }]}
                  >
                    {formatAvailabilityLabel(contact.availability)}
                  </Text>
                </View>
              </View>

              <Text style={styles.proDescription}>{contact.description}</Text>

              <View style={styles.specializationRow}>
                {contact.specialization.map(item => (
                  <View key={item} style={styles.specializationPill}>
                    <Text style={styles.specializationText}>{item}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleCall(contact.phone)}>
                  <Phone size={18} color="#fff" />
                  <Text style={styles.actionButtonText}>Llamar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.actionButtonGhost]} onPress={() => handleEmail(contact.email)}>
                  <Mail size={18} color={Colors.light.tint} />
                  <Text style={[styles.actionButtonText, styles.actionButtonGhostText]}>Correo</Text>
                </TouchableOpacity>
                {contact.website ? (
                  <TouchableOpacity style={[styles.actionButton, styles.actionButtonGhost]} onPress={() => handleWebsite(contact.website)}>
                    <Globe size={18} color={Colors.light.tint} />
                    <Text style={[styles.actionButtonText, styles.actionButtonGhostText]}>Sitio</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {contact.languages?.length ? (
                <View style={styles.languageRow}>
                  <Text style={styles.languageLabel}>Idiomas: </Text>
                  <Text style={styles.languageText}>{contact.languages.join(', ')}</Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones rapidas</Text>
          <View style={styles.quickGrid}>
            {QUICK_ACTIONS.map(action => {
              const Icon = action.icon;
              return (
                <TouchableOpacity
                  key={action.id}
                  style={styles.quickCard}
                  onPress={() => router.push(action.target)}
                >
                  <View style={styles.quickIconWrapper}>
                    <Icon size={20} color={Colors.light.tint} />
                  </View>
                  <Text style={styles.quickTitle}>{action.label}</Text>
                  <Text style={styles.quickDescription}>{action.description}</Text>
                  <ArrowUpRight size={16} color={Colors.light.tint} style={styles.quickArrow} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historias de la comunidad</Text>
          {COMMUNITY_STORIES.map(story => (
            <TouchableOpacity
              key={story.id}
              style={styles.storyCard}
              onPress={() => handleStoryPress(story)}
              activeOpacity={0.9}
            >
              <View style={styles.storyHeader}>
                <View style={styles.storyBadge}>
                  <Users size={16} color={Colors.light.tint} />
                </View>
                <View style={styles.storyHeaderText}>
                  <Text style={styles.storyAuthor}>{story.author}</Text>
                  <Text style={styles.storyFocus}>{story.focus}</Text>
                </View>
              </View>
              <Text style={styles.storyTitle}>{story.title}</Text>
              <Text style={styles.storySummary}>{story.summary}</Text>
              <View style={styles.storyFooter}>
                <View style={styles.storyStat}>
                  <Heart size={16} color={Colors.light.tint} />
                  <Text style={styles.storyStatText}>{story.reactions}</Text>
                </View>
                <View style={styles.storyStat}>
                  <MessageCircle size={16} color={Colors.light.tabIconDefault} />
                  <Text style={styles.storyStatText}>{story.replies}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mis comunidades</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/communities')}>
              <Text style={styles.resetFilters}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {!isAuthenticated ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Inicia sesion para crear y seguir comunidades</Text>
              <Text style={styles.emptySubtitle}>
                Podras compartir avances, recibir apoyo y crear espacios a tu ritmo.
              </Text>
            </View>
          ) : isLoadingCommunities ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Cargando tus comunidades...</Text>
            </View>
          ) : myCommunities.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Aun no sigues ninguna comunidad</Text>
              <Text style={styles.emptySubtitle}>
                Explora grupos en la pestaña comunidades o crea el tuyo en segundos.
              </Text>
            </View>
          ) : (
            myCommunities.slice(0, 3).map((community: Community) => (
              <View key={community.id} style={styles.communityCardRow}>
                <View style={styles.communityInfoBlock}>
                  <Text style={styles.communityRowName}>{community.name}</Text>
                  <Text style={styles.communityRowDescription}>{community.focusArea}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.secondaryCta, styles.communityRowButton]}
                  onPress={() => {
                    const isMember = community.isMember;
                    if (isMember) {
                      leaveCommunityMutation.mutate(community.id);
                    } else {
                      joinCommunityMutation.mutate(community.id);
                    }
                  }}
                >
                  <Text style={styles.secondaryCtaText}>{community.isMember ? 'Salir' : 'Unirme'}</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          {isAuthenticated ? (
            <View style={styles.newCommunityCard}>
              <Text style={styles.newCommunityTitle}>Crear nuevo espacio</Text>
              <Text style={styles.newCommunitySubtitle}>
                Diseña un punto de encuentro para personas que comparten tu reto actual.
              </Text>
              <TouchableOpacity style={styles.createCommunityButton} onPress={handleCreateCommunity}>
                <Text style={styles.createCommunityButtonText}>
                  {createCommunityMutation.isPending ? 'Publicando...' : 'Publicar comunidad'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  resetFilters: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: '600',
  },
  heroCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
  },
  heroHeader: {
    gap: 12,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.2,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 21,
  },
  heroBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  heroBadge: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  heroActions: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 12,
  },
  primaryCta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 12,
    borderRadius: 14,
  },
  primaryCtaText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryCta: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  secondaryCtaText: {
    color: '#fff',
    fontWeight: '600',
  },
  emergencyRow: {
    gap: 16,
  },
  emergencyCard: {
    width: 240,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  emergencyHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  emergencyPhone: {
    fontSize: 14,
    color: Colors.light.tint,
  },
  emergencyDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.light.textSecondary,
  },
  emergencyFooter: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emergencyFooterText: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  emergencyBadge: {
    backgroundColor: `${Colors.light.tint}1A`,
    color: Colors.light.tint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '600',
  },
  filterRow: {
    gap: 12,
    paddingBottom: 6,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterChipActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  filterChipText: {
    fontSize: 13,
    color: Colors.light.tabIconDefault,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  proCard: {
    marginTop: 16,
    borderRadius: 20,
    padding: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  proHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  proAvatar: {
    width: 58,
    height: 58,
    borderRadius: 16,
  },
  proAvatarFallback: {
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proInfo: {
    flex: 1,
    gap: 4,
  },
  proName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  proTitle: {
    fontSize: 13,
    color: Colors.light.tabIconDefault,
  },
  proMetaRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  proMetaChip: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: 'center',
  },
  proMetaText: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  availabilityTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  proDescription: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.light.textSecondary,
  },
  specializationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  specializationPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: `${Colors.light.tint}12`,
  },
  specializationText: {
    fontSize: 12,
    color: Colors.light.tint,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    paddingVertical: 10,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  actionButtonGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.tint,
  },
  actionButtonGhostText: {
    color: Colors.light.tint,
  },
  languageRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  languageLabel: {
    fontSize: 13,
    color: Colors.light.text,
    fontWeight: '600',
  },
  languageText: {
    fontSize: 13,
    color: Colors.light.tabIconDefault,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickCard: {
    flexBasis: '48%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    position: 'relative',
    gap: 8,
  },
  quickIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
  },
  quickDescription: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  quickArrow: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  storyCard: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 10,
  },
  storyHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  storyBadge: {
    width: 36,
    height: 36,
    borderRadius: 16,
    backgroundColor: `${Colors.light.tint}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyHeaderText: {
    flex: 1,
  },
  storyAuthor: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  storyFocus: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  storySummary: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 19,
  },
  storyFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  storyStat: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  storyStatText: {
    fontSize: 13,
    color: Colors.light.tabIconDefault,
  },
  emptyCard: {
    marginTop: 12,
    backgroundColor: Colors.light.background,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  communityCardRow: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  communityInfoBlock: {
    flex: 1,
    paddingRight: 12,
  },
  communityRowName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
  },
  communityRowDescription: {
    fontSize: 13,
    color: Colors.light.tabIconDefault,
  },
  communityRowButton: {
    backgroundColor: `${Colors.light.tint}15`,
    borderColor: 'transparent',
  },
  newCommunityCard: {
    marginTop: 18,
    backgroundColor: Colors.light.background,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 12,
  },
  newCommunityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  newCommunitySubtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  createCommunityButton: {
    marginTop: 8,
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  createCommunityButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
