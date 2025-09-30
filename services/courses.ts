import { supabase } from '@/lib/supabase';
import { Course, SubscriptionStatus } from '@/types/social';
import { SubscriptionPlan } from '@/types/auth';

export interface CourseOverview {
  courses: Course[];
  plans: SubscriptionPlan[];
  subscription: SubscriptionStatus;
}

const mapCourse = (row: any): Course => ({
  id: row.id,
  title: row.title,
  description: row.description,
  category: row.category ?? 'General',
  coverUrl: row.cover_url ?? undefined,
  level: (row.level ?? 'beginner') as Course['level'],
  durationMinutes: row.duration_minutes ?? 0,
  modulesCount: row.modules_count ?? 0,
  isPremium: Boolean(row.is_premium),
  price: row.price ?? 0,
  createdAt: row.created_at ? new Date(row.created_at) : new Date(),
});

const mapPlan = (row: any): SubscriptionPlan => ({
  id: row.id,
  name: row.name,
  duration: row.duration_months ?? 1,
  price: row.price ?? 0,
  features: Array.isArray(row.features) ? row.features : typeof row.features === 'string' ? row.features.split(',').map((item: string) => item.trim()) : [],
  popular: Boolean(row.popular),
});

const mapSubscription = (row: any): SubscriptionStatus => ({
  planId: row?.plan_id ?? '',
  status: (row?.status ?? 'none') as SubscriptionStatus['status'],
  expiresAt: row?.expires_at ? new Date(row.expires_at) : undefined,
});

export const COURSES_QUERY_KEY = ['courses', 'overview'];

export async function fetchCourseOverview(userId: string): Promise<CourseOverview> {
  const [coursesResponse, plansResponse, subscriptionResponse] = await Promise.all([
    supabase.from('courses').select('*').order('created_at', { ascending: true }),
    supabase.from('subscription_plans').select('*').order('price', { ascending: true }),
    supabase
      .from('user_subscriptions')
      .select('plan_id, status, expires_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (coursesResponse.error) {
    throw new Error(coursesResponse.error.message);
  }
  if (plansResponse.error) {
    throw new Error(plansResponse.error.message);
  }
  if (subscriptionResponse.error && subscriptionResponse.error.code !== 'PGRST116') {
    throw new Error(subscriptionResponse.error.message);
  }

  const courses = (coursesResponse.data ?? []).map(mapCourse);
  const plans = (plansResponse.data ?? []).map(mapPlan);
  const subscription = subscriptionResponse.data
    ? mapSubscription(subscriptionResponse.data)
    : { planId: '', status: 'none' as const };

  return {
    courses,
    plans,
    subscription,
  };
}

export async function activateSubscription(userId: string, planId: string, durationMonths: number): Promise<void> {
  const startsAt = new Date();
  const expiresAt = new Date(startsAt);
  expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

  const { error } = await supabase.from('user_subscriptions').upsert({
    user_id: userId,
    plan_id: planId,
    status: 'active',
    started_at: startsAt.toISOString(),
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function cancelSubscription(userId: string): Promise<void> {
  const { error } = await supabase
    .from('user_subscriptions')
    .update({ status: 'cancelled' })
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}

