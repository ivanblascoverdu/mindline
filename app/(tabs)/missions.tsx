import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Dumbbell, 
  BookOpen, 
  Target, 
  Users, 
  Palette,
  ChevronRight,
  Trophy,
  Star,
  CheckCircle,
  Circle,
  Zap,
  Filter
} from 'lucide-react-native';

import { useTasks } from '@/contexts/TaskContext';
import { MISSION_CATEGORIES, MissionCategory, Mission } from '@/types/task';
import Colors from '@/constants/colors';

const iconMap = {
  'dumbbell': Dumbbell,
  'book-open': BookOpen,
  'target': Target,
  'users': Users,
  'palette': Palette,
};

export default function MissionsScreen() {
  const { missions, toggleMission } = useTasks();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredMissions = selectedCategory === 'all' 
    ? missions 
    : missions.filter(mission => mission.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return Colors.light.textSecondary;
    }
  };

  const getCategoryColor = (categoryId: string) => {
    const category = MISSION_CATEGORIES.find(cat => cat.id === categoryId);
    return category?.color || Colors.primary;
  };

  const MissionCard = ({ mission }: { mission: Mission }) => {
    const scaleAnim = new Animated.Value(1);
    const categoryColor = getCategoryColor(mission.category);
    const difficultyColor = getDifficultyColor(mission.difficulty);

    const handlePress = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      toggleMission(mission.id);
    };

    return (
      <Animated.View style={[styles.missionCard, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={styles.missionContent}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <View style={styles.missionLeft}>
            <View style={styles.checkboxContainer}>
              {mission.completed ? (
                <CheckCircle color={Colors.success} size={24} />
              ) : (
                <Circle color={Colors.light.textSecondary} size={24} />
              )}
            </View>
            <View style={styles.missionInfo}>
              <Text
                style={[
                  styles.missionTitle,
                  mission.completed && styles.missionTitleCompleted,
                ]}
              >
                {mission.title}
              </Text>
              <Text
                style={[
                  styles.missionDescription,
                  mission.completed && styles.missionDescriptionCompleted,
                ]}
              >
                {mission.description}
              </Text>
              <View style={styles.missionMeta}>
                <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
                  <Text style={[styles.categoryText, { color: categoryColor }]}>
                    {MISSION_CATEGORIES.find(cat => cat.id === mission.category)?.name || mission.category}
                  </Text>
                </View>
                <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor + '20' }]}>
                  <Text style={[styles.difficultyText, { color: difficultyColor }]}>
                    {mission.difficulty}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.missionRight}>
            <View style={styles.pointsBadge}>
              <Zap color={Colors.accent} size={16} />
              <Text style={styles.pointsText}>{mission.points}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const FilterButton = ({ categoryId, label }: { categoryId: string; label: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedCategory === categoryId && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedCategory(categoryId)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedCategory === categoryId && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const completedMissions = filteredMissions.filter(m => m.completed).length;
  const totalPoints = filteredMissions.filter(m => m.completed).reduce((sum, m) => sum + m.points, 0);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <View>
          <Text style={styles.title}>Missions</Text>
          <Text style={styles.subtitle}>
            {completedMissions}/{filteredMissions.length} completed • {totalPoints} points earned
          </Text>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={[{ id: 'all', name: 'All' }, ...MISSION_CATEGORIES]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FilterButton categoryId={item.id} label={item.name} />
          )}
          contentContainerStyle={styles.filtersList}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {filteredMissions.length === 0 ? (
        <View style={styles.emptyState}>
          <Target color={Colors.light.textSecondary} size={64} />
          <Text style={styles.emptyTitle}>No missions found</Text>
          <Text style={styles.emptySubtitle}>
            Try selecting a different category
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMissions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MissionCard mission={item} />}
          contentContainerStyle={styles.missionsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
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
  filtersContainer: {
    paddingBottom: 16,
  },
  filtersList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  filterButtonTextActive: {
    color: 'white',
  },
  missionsList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  missionCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  missionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  missionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkboxContainer: {
    marginTop: 2,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  missionTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.light.textSecondary,
  },
  missionDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  missionDescriptionCompleted: {
    textDecorationLine: 'line-through',
  },
  missionMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  missionRight: {
    alignItems: 'center',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.accent,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyTitle: {
    fontSize: 24,
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