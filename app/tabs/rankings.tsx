import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Trophy, 
  Medal, 
  Star, 
  TrendingUp, 
  Target, 
  Zap,
  Crown,
  Award
} from 'lucide-react-native';

import { useTasks } from '@/contexts/TaskContext';
import { calculateLevel, getPointsForNextLevel } from '@/types/task';
import Colors from '@/constants/colors';

export default function RankingsScreen() {
  const { userProfile, getStats, getLeaderboard } = useTasks();
  const stats = getStats();
  const leaderboard = getLeaderboard();
  const insets = useSafeAreaInsets();

  const nextLevelPoints = getPointsForNextLevel(userProfile.totalPoints);
  const currentLevelProgress = userProfile.totalPoints > 0 ? 
    ((userProfile.totalPoints % 1000) / 1000) * 100 : 0;

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    gradient, 
    subtitle 
  }: {
    title: string;
    value: number | string;
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

  const RankCard = ({ rank, name, points, level, isCurrentUser = false }: {
    rank: number;
    name: string;
    points: number;
    level: number;
    isCurrentUser?: boolean;
  }) => {
    const getRankIcon = () => {
      switch (rank) {
        case 1: return <Crown color="#FFD700" size={24} />;
        case 2: return <Medal color="#C0C0C0" size={24} />;
        case 3: return <Award color="#CD7F32" size={24} />;
        default: return <Text style={styles.rankNumber}>#{rank}</Text>;
      }
    };

    return (
      <View style={[styles.rankCard, isCurrentUser && styles.currentUserCard]}>
        <View style={styles.rankLeft}>
          <View style={styles.rankIcon}>
            {getRankIcon()}
          </View>
          <View style={styles.rankInfo}>
            <Text style={[styles.rankName, isCurrentUser && styles.currentUserText]}>
              {name} {isCurrentUser && '(You)'}
            </Text>
            <Text style={styles.rankLevel}>Level {level}</Text>
          </View>
        </View>
        <View style={styles.rankRight}>
          <Text style={[styles.rankPoints, isCurrentUser && styles.currentUserText]}>
            {points.toLocaleString()}
          </Text>
          <Text style={styles.rankPointsLabel}>points</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
          <Text style={styles.title}>Your Ranking</Text>
          <Text style={styles.subtitle}>Track your progress and compete</Text>
        </View>

        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <LinearGradient
            colors={[Colors.gradients.primary[0], Colors.gradients.primary[1]]}
            style={styles.profileGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.profileHeader}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>
                  {userProfile.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userProfile.name}</Text>
                <Text style={styles.profileLevel}>Level {userProfile.level}</Text>
                <Text style={styles.profileRank}>Rank #{userProfile.rank}</Text>
              </View>
              <View style={styles.profilePoints}>
                <Text style={styles.profilePointsValue}>
                  {userProfile.totalPoints.toLocaleString()}
                </Text>
                <Text style={styles.profilePointsLabel}>Total Points</Text>
              </View>
            </View>
            
            {nextLevelPoints > 0 && (
              <View style={styles.levelProgress}>
                <View style={styles.levelProgressHeader}>
                  <Text style={styles.levelProgressText}>
                    {nextLevelPoints} points to next level
                  </Text>
                  <Text style={styles.levelProgressPercent}>
                    {Math.round(currentLevelProgress)}%
                  </Text>
                </View>
                <View style={styles.levelProgressBar}>
                  <View 
                    style={[
                      styles.levelProgressFill, 
                      { width: `${currentLevelProgress}%` }
                    ]} 
                  />
                </View>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Points"
            value={stats.totalPoints.toLocaleString()}
            icon={Star}
            gradient={[Colors.gradients.primary[0], Colors.gradients.primary[1]]}
          />
          
          <StatCard
            title="Points Today"
            value={stats.pointsToday}
            icon={Zap}
            gradient={[Colors.gradients.secondary[0], Colors.gradients.secondary[1]]}
          />
          
          <StatCard
            title="Completed Missions"
            value={userProfile.completedMissions}
            icon={Target}
            gradient={[Colors.gradients.warm[0], Colors.gradients.warm[1]]}
          />
          
          <StatCard
            title="Current Level"
            value={userProfile.level}
            icon={TrendingUp}
            gradient={[Colors.success, Colors.accent]}
          />
        </View>

        {/* Leaderboard */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leaderboard</Text>
          
          <View style={styles.leaderboard}>
            {leaderboard.map((user, index) => (
              <RankCard
                key={user.id}
                rank={user.rank}
                name={user.name}
                points={user.totalPoints}
                level={user.level}
                isCurrentUser={user.id === userProfile.id}
              />
            ))}
            
            {/* Mock additional users for demonstration */}
            <RankCard
              rank={2}
              name="Alex Johnson"
              points={1250}
              level={calculateLevel(1250)}
            />
            <RankCard
              rank={3}
              name="Sarah Wilson"
              points={980}
              level={calculateLevel(980)}
            />
            <RankCard
              rank={4}
              name="Mike Chen"
              points={750}
              level={calculateLevel(750)}
            />
            <RankCard
              rank={5}
              name="Emma Davis"
              points={620}
              level={calculateLevel(620)}
            />
          </View>
        </View>

        {stats.totalPoints === 0 && (
          <View style={styles.emptyState}>
            <Trophy color={Colors.light.textSecondary} size={48} />
            <Text style={styles.emptyTitle}>Start Your Journey</Text>
            <Text style={styles.emptySubtitle}>
              Complete missions and tasks to earn points and climb the leaderboard
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
  profileCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  profileGradient: {
    padding: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  profileLevel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  profileRank: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  profilePoints: {
    alignItems: 'flex-end',
  },
  profilePointsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profilePointsLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  levelProgress: {
    marginTop: 16,
  },
  levelProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelProgressText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  levelProgressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  levelProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  statTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  section: {
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  leaderboard: {
    gap: 12,
  },
  rankCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.textSecondary,
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  currentUserText: {
    color: Colors.primary,
  },
  rankLevel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  rankRight: {
    alignItems: 'flex-end',
  },
  rankPoints: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  rankPointsLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
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