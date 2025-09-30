import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Task, TaskStats, Mission, MISSION_CATEGORIES, UserProfile, calculateLevel } from '@/types/task';

const STORAGE_KEY = 'tasks';
const MISSIONS_STORAGE_KEY = 'missions';
const USER_PROFILE_STORAGE_KEY = 'userProfile';

export const [TaskProvider, useTasks] = createContextHook(() => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'user1',
    name: 'Player',
    totalPoints: 0,
    level: 1,
    completedMissions: 0,
    rank: 1
  });
  const [isLoading, setIsLoading] = useState(true);

  const hapticFeedback = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const saveTasks = useCallback(async (newTasks: Task[]) => {
    try {
      if (!Array.isArray(newTasks)) return;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  }, []);

  const saveMissions = useCallback(async (newMissions: Mission[]) => {
    try {
      if (!Array.isArray(newMissions)) return;
      await AsyncStorage.setItem(MISSIONS_STORAGE_KEY, JSON.stringify(newMissions));
    } catch (error) {
      console.error('Error saving missions:', error);
    }
  }, []);

  const saveUserProfile = useCallback(async (profile: UserProfile) => {
    try {
      await AsyncStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Load tasks
      const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        }));
        setTasks(parsedTasks);
      }

      // Load missions or initialize from default categories
      const storedMissions = await AsyncStorage.getItem(MISSIONS_STORAGE_KEY);
      if (storedMissions) {
        const parsedMissions = JSON.parse(storedMissions).map((mission: any) => ({
          ...mission,
          completedAt: mission.completedAt ? new Date(mission.completedAt) : undefined,
        }));
        setMissions(parsedMissions);
      } else {
        // Initialize missions from categories
        const allMissions = MISSION_CATEGORIES.flatMap(category => category.missions);
        setMissions(allMissions);
        await AsyncStorage.setItem(MISSIONS_STORAGE_KEY, JSON.stringify(allMissions));
      }

      // Load user profile
      const storedProfile = await AsyncStorage.getItem(USER_PROFILE_STORAGE_KEY);
      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserProfile = useCallback((pointsEarned: number = 0) => {
    const completedMissionsCount = missions.filter(m => m.completed).length;
    const totalPoints = missions
      .filter(m => m.completed)
      .reduce((sum, m) => sum + m.points, 0);
    
    const newProfile: UserProfile = {
      ...userProfile,
      totalPoints,
      level: calculateLevel(totalPoints),
      completedMissions: completedMissionsCount,
      rank: 1 // For now, always rank 1. In a real app, this would be calculated against other users
    };
    
    setUserProfile(newProfile);
    saveUserProfile(newProfile);
  }, [missions, userProfile, saveUserProfile]);

  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'completed' | 'points' | 'difficulty'>) => {
    const points = taskData.priority === 'high' ? 75 : taskData.priority === 'medium' ? 50 : 25;
    const difficulty = taskData.priority === 'high' ? 'hard' : taskData.priority === 'medium' ? 'medium' : 'easy';
    
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date(),
      points,
      difficulty,
    };
    
    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    hapticFeedback();
  }, [tasks, saveTasks, hapticFeedback]);

  const toggleTask = useCallback((taskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const completed = !task.completed;
        return {
          ...task,
          completed,
          completedAt: completed ? new Date() : undefined,
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    hapticFeedback();
  }, [tasks, saveTasks, hapticFeedback]);

  const toggleMission = useCallback((missionId: string) => {
    const updatedMissions = missions.map(mission => {
      if (mission.id === missionId) {
        const completed = !mission.completed;
        return {
          ...mission,
          completed,
          completedAt: completed ? new Date() : undefined,
        };
      }
      return mission;
    });
    
    setMissions(updatedMissions);
    saveMissions(updatedMissions);
    hapticFeedback();
    
    // Update user profile after mission completion
    setTimeout(() => updateUserProfile(), 100);
  }, [missions, saveMissions, hapticFeedback, updateUserProfile]);

  const deleteTask = useCallback((taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    hapticFeedback();
  }, [tasks, saveTasks, hapticFeedback]);

  const getStats = useCallback((): TaskStats => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const completed = tasks.filter(task => task.completed);
    const completedToday = completed.filter(task => 
      task.completedAt && task.completedAt >= today
    );
    const completedThisWeek = completed.filter(task => 
      task.completedAt && task.completedAt >= weekStart
    );

    const completedMissions = missions.filter(mission => mission.completed);
    const completedMissionsToday = completedMissions.filter(mission => 
      mission.completedAt && mission.completedAt >= today
    );
    const completedMissionsThisWeek = completedMissions.filter(mission => 
      mission.completedAt && mission.completedAt >= weekStart
    );

    const totalPoints = completed.reduce((sum, task) => sum + task.points, 0) + 
                       completedMissions.reduce((sum, mission) => sum + mission.points, 0);
    const pointsToday = completedToday.reduce((sum, task) => sum + task.points, 0) + 
                       completedMissionsToday.reduce((sum, mission) => sum + mission.points, 0);
    const pointsThisWeek = completedThisWeek.reduce((sum, task) => sum + task.points, 0) + 
                          completedMissionsThisWeek.reduce((sum, mission) => sum + mission.points, 0);

    return {
      total: tasks.length,
      completed: completed.length,
      pending: tasks.length - completed.length,
      completedToday: completedToday.length,
      completedThisWeek: completedThisWeek.length,
      totalPoints,
      pointsToday,
      pointsThisWeek,
    };
  }, [tasks, missions]);

  const getMissionsByCategory = useCallback((categoryId: string) => {
    return missions.filter(mission => mission.category === categoryId);
  }, [missions]);

  const getLeaderboard = useCallback((): UserProfile[] => {
    // For now, return just the current user
    // In a real app, this would fetch from a server
    return [userProfile];
  }, [userProfile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update user profile when missions change
  useEffect(() => {
    if (!isLoading) {
      updateUserProfile();
    }
  }, [missions, isLoading]);

  return useMemo(() => ({
    tasks,
    missions,
    userProfile,
    isLoading,
    addTask,
    toggleTask,
    toggleMission,
    deleteTask,
    getStats,
    getMissionsByCategory,
    getLeaderboard,
  }), [
    tasks, 
    missions, 
    userProfile, 
    isLoading, 
    addTask, 
    toggleTask, 
    toggleMission, 
    deleteTask, 
    getStats, 
    getMissionsByCategory, 
    getLeaderboard
  ]);
});