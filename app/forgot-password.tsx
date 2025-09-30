import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle, Clock, Target, TrendingUp, Star, Zap, Award } from 'lucide-react-native';

import { useTasks } from '@/contexts/TaskContext';
import { calculateLevel } from '@/types/task';
import Colors from '@/constants/colors';

export default function StatsScreen() {
  const { getStats, userProfile } = useTasks();
  const stats = getStats();
  const insets = useSafeAreaInsets();

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    gradient, 
    subtitle 
  }: {
    title: string;
    value: number;
    icon: any;
    gradient: [string, string];
    subtitle?: string;
  }) => (
    <View style={styles.statCard}>
      <LinearGradient
        colors={gradient}
        style={styles.statGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.statContent}>
          <Icon color="white" size={24} />
          <View style={styles.statText}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
            {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>Track your productivity</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Total Points"
            value={stats.totalPoints}
            icon={Star}
            gradient={[Colors.gradients.primary[0], Colors.gradients.primary[1]]}
          />
          
          <StatCard
            title="Current Level"
            value={userProfile.level}
            icon={Award}
            gradient={[Colors.gradients.secondary[0], Colors.gradients.secondary[1]]}
          />
          
          <StatCard
            title="Points Today"
            value={stats.pointsToday}
            icon={Zap}
            gradient={[Colors.gradients.warm[0], Colors.gradients.warm[1]]}
          />
          
          <StatCard
            title="Completion Rate"
            value={completionRate}
            icon={TrendingUp}
            gradient={[Colors.success, Colors.accent]}
            subtitle="%"
          />
        </View>
        
        {/* Additional Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Tasks"
            value={stats.total}
            icon={Target}
            gradient={[Colors.primary, Colors.accent]}
          />
          
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle}
            gradient={[Colors.success, '#22c55e']}
          />
          
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={Clock}
            gradient={['#f59e0b', '#eab308']}
          />
          
          <StatCard
            title="Points This Week"
            value={stats.pointsThisWeek}
            icon={Star}
            gradient={['#8b5cf6', '#a855f7']}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <CheckCircle color={Colors.success} size={20} />
              </View>
              <View style={styles.activityText}>
                <Text style={styles.activityTitle}>Completed Today</Text>
                <Text style={styles.activityValue}>{stats.completedToday} tasks</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Star color={Colors.accent} size={20} />
              </View>
              <View style={styles.activityText}>
                <Text style={styles.activityTitle}>Points Earned Today</Text>
                <Text style={styles.activityValue}>{stats.pointsToday} points</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <TrendingUp color={Colors.primary} size={20} />
              </View>
              <View style={styles.activityText}>
                <Text style={styles.activityTitle}>This Week</Text>
                <Text style={styles.activityValue}>{stats.completedThisWeek} tasks • {stats.pointsThisWeek} points</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Award color={Colors.gradients.primary[0]} size={20} />
              </View>
              <View style={styles.activityText}>
                <Text style={styles.activityTitle}>Current Rank</Text>
                <Text style={styles.activityValue}>#{userProfile.rank} • Level {userProfile.level}</Text>
              </View>
            </View>
          </View>
        </View>

        {stats.total === 0 && (
          <View style={styles.emptyState}>
            <Target color={Colors.light.textSecondary} size={48} />
            <Text style={styles.emptyTitle}>No tasks yet</Text>
            <Text style={styles.emptySubtitle}>
              Start adding tasks to see your progress here
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    width: '47%',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statGradient: {
    padding: 20,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statText: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  section: {
    padding: 24,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  activityCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
  },
  activityValue: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
    marginTop: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
});