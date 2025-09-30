import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, CheckCircle, Clock, Lock, PlayCircle, Shield } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import {
  COURSES_QUERY_KEY,
  activateSubscription,
  cancelSubscription,
  fetchCourseOverview,
} from '@/services/courses';
import { Course, SubscriptionStatus } from '@/types/social';
import { SubscriptionPlan } from '@/types/auth';

const CourseCard = ({ course, isUnlocked }: { course: Course; isUnlocked: boolean }) => (
  <View style={[styles.courseCard, !isUnlocked && styles.courseLocked]}> 
    <View style={styles.courseHeader}>
      <View>{isUnlocked ? <PlayCircle size={22} color={Colors.light.tint} /> : <Lock size={22} color={Colors.light.tabIconDefault} />}</View>
      <View style={styles.courseTitleWrapper}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.courseCategory}>{course.category} - {course.level === 'beginner' ? 'Nivel inicial' : course.level === 'intermediate' ? 'Nivel intermedio' : 'Nivel avanzado'}</Text>
      </View>
      {course.isPremium ? (
        <View style={[styles.premiumBadge, isUnlocked ? styles.premiumActive : null]}>
          <Shield size={14} color={isUnlocked ? '#fff' : Colors.light.tint} />
          <Text style={[styles.premiumBadgeText, isUnlocked ? styles.premiumBadgeTextActive : null]}>
            Premium
          </Text>
        </View>
      ) : null}
    </View>

    <Text style={styles.courseDescription}>{course.description}</Text>

    <View style={styles.courseMetaRow}>
      <View style={styles.courseMeta}>
        <Clock size={16} color={Colors.light.tabIconDefault} />
        <Text style={styles.courseMetaText}>{Math.round(course.durationMinutes / 60)}h aproximadas</Text>
      </View>
      <View style={styles.courseMeta}>
        <Calendar size={16} color={Colors.light.tabIconDefault} />
        <Text style={styles.courseMetaText}>{course.modulesCount} modulos</Text>
      </View>
    </View>

    {!isUnlocked ? (
      <View style={styles.lockedOverlay}>
        <Lock size={18} color={Colors.light.tint} />
        <Text style={styles.lockedText}>Suscribete para desbloquear este contenido</Text>
      </View>
    ) : null}
  </View>
);

export default function CoursesScreen() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const overviewQuery = useQuery({
    queryKey: COURSES_QUERY_KEY,
    queryFn: () => fetchCourseOverview(user!.id),
    enabled: Boolean(user?.id),
  });

  const activateMutation = useMutation({
    mutationFn: ({ planId, duration }: { planId: string; duration: number }) => activateSubscription(user!.id, planId, duration),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY }),
    onError: error => {
      Alert.alert('No pudimos activar la suscripcion', error instanceof Error ? error.message : 'Intenta de nuevo.');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelSubscription(user!.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY }),
    onError: error => {
      Alert.alert('No pudimos cancelar la suscripcion', error instanceof Error ? error.message : 'Intenta de nuevo.');
    },
  });

  const subscriptionStatus = overviewQuery.data?.subscription ?? { status: 'none', planId: '' } as SubscriptionStatus;
  const activePlan = useMemo(() => overviewQuery.data?.plans.find(plan => plan.id === subscriptionStatus.planId), [overviewQuery.data, subscriptionStatus.planId]);
  const isActive = subscriptionStatus.status === 'active';

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Inicia sesion para acceder a los cursos y suscripciones.</Text>
      </View>
    );
  }

  if (overviewQuery.isLoading) {
    return (
      <View style={styles.placeholder}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.placeholderText}>Cargando cursos y planes...</Text>
      </View>
    );
  }

  if (overviewQuery.isError) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.errorText}>No pudimos cargar la informacion. Revisa tu conexion e intentalo de nuevo.</Text>
      </View>
    );
  }

  const { courses, plans } = overviewQuery.data ?? { courses: [], plans: [] };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Tu suscripcion</Text>
        {isActive && activePlan ? (
          <View style={styles.statusActiveBox}>
            <Text style={styles.statusPlanName}>{activePlan.name}</Text>
            <Text style={styles.statusDetail}>
              Activa hasta {subscriptionStatus.expiresAt ? subscriptionStatus.expiresAt.toLocaleDateString() : 'proximamente'}
            </Text>
            <TouchableOpacity
              style={[styles.secondaryButton, cancelMutation.isPending && styles.disabledButton]}
              onPress={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <ActivityIndicator color={Colors.light.tint} />
              ) : (
                <Text style={styles.secondaryButtonText}>Cancelar suscripcion</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.statusDetail}>
            No tienes una suscripcion activa. Elige un plan para acceder a todos los cursos premium.
          </Text>
        )}
      </View>

      <Text style={styles.sectionLabel}>Planes disponibles</Text>
      <View style={styles.planGrid}>
        {plans.map(plan => {
          const isCurrent = isActive && plan.id === subscriptionStatus.planId;

          return (
            <View key={plan.id} style={[styles.planCard, plan.popular && styles.planCardHighlighted]}>
              {plan.popular ? <Text style={styles.planPopularBadge}>Mas elegido</Text> : null}
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>{plan.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</Text>
              <Text style={styles.planDuration}>{plan.duration} meses de acceso</Text>
              <View style={styles.planFeatures}>
                {plan.features.map(feature => (
                  <View key={feature} style={styles.planFeature}>
                    <CheckCircle size={16} color={Colors.light.tint} />
                    <Text style={styles.planFeatureText}>{feature}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.primaryButton, (isCurrent || activateMutation.isPending) && styles.disabledButton]}
                onPress={() => activateMutation.mutate({ planId: plan.id, duration: plan.duration })}
                disabled={isCurrent || activateMutation.isPending}
              >
                {isCurrent ? (
                  <Text style={styles.primaryButtonText}>Plan actual</Text>
                ) : activateMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Suscribirme</Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>Cursos disponibles</Text>
      <View style={styles.coursesGrid}>
        {courses.map(course => {
          const unlocked = !course.isPremium || isActive;
          return <CourseCard key={course.id} course={course} isUnlocked={unlocked} />;
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  placeholderText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 15,
    color: Colors.error,
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  statusActiveBox: {
    gap: 8,
  },
  statusPlanName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  statusDetail: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: Colors.light.tint,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: Colors.light.tint,
    fontSize: 15,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  planGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 12,
  },
  planCardHighlighted: {
    borderColor: Colors.light.tint,
    shadowColor: Colors.light.tint,
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 4,
  },
  planPopularBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${Colors.light.tint}20`,
    color: Colors.light.tint,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    textTransform: 'uppercase',
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.tint,
  },
  planDuration: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  planFeatures: {
    gap: 10,
  },
  planFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planFeatureText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  coursesGrid: {
    gap: 16,
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 14,
  },
  courseLocked: {
    opacity: 0.65,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  courseTitleWrapper: {
    flex: 1,
    gap: 4,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  courseCategory: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eef2ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumActive: {
    backgroundColor: Colors.light.tint,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  premiumBadgeTextActive: {
    color: '#fff',
  },
  courseDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  courseMetaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  courseMetaText: {
    fontSize: 13,
    color: Colors.light.tabIconDefault,
  },
  lockedOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 12,
  },
  lockedText: {
    fontSize: 13,
    color: Colors.light.tabIconDefault,
  },
});




