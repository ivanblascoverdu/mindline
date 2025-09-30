import React, { useState } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Plus,
  Check,
  Trash2,
  Circle,
  CheckCircle,
  X,
  Flag,
} from 'lucide-react-native';

import { useTasks } from '@/contexts/TaskContext';
import { Task, TASK_CATEGORIES, TASK_PRIORITIES } from '@/types/task';
import Colors from '@/constants/colors';

export default function TasksScreen() {
  const { tasks, addTask, toggleTask, deleteTask } = useTasks();
  const insets = useSafeAreaInsets();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Personal');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDifficulty, setNewTaskDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask({
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined,
        category: newTaskCategory,
        priority: newTaskPriority,
      });
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskCategory('Personal');
      setNewTaskPriority('medium');
      setNewTaskDifficulty('medium');
      setShowAddModal(false);
    }
  };

  const TaskItem = ({ task }: { task: Task }) => {
    const priorityColor = TASK_PRIORITIES.find(p => p.value === task.priority)?.color || Colors.light.textSecondary;
    const scaleAnim = new Animated.Value(1);

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
      toggleTask(task.id);
    };

    return (
      <Animated.View style={[styles.taskItem, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={styles.taskContent}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <View style={styles.taskLeft}>
            <View style={styles.checkboxContainer}>
              {task.completed ? (
                <CheckCircle color={Colors.success} size={24} />
              ) : (
                <Circle color={Colors.light.textSecondary} size={24} />
              )}
            </View>
            <View style={styles.taskInfo}>
              <Text
                style={[
                  styles.taskTitle,
                  task.completed && styles.taskTitleCompleted,
                ]}
              >
                {task.title}
              </Text>
              {task.description && (
                <Text
                  style={[
                    styles.taskDescription,
                    task.completed && styles.taskDescriptionCompleted,
                  ]}
                >
                  {task.description}
                </Text>
              )}
              <View style={styles.taskMeta}>
                <View style={[styles.categoryBadge, { backgroundColor: Colors.light.backgroundSecondary }]}>
                  <Text style={styles.categoryText}>{task.category}</Text>
                </View>
                <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsText}>+{task.points} pts</Text>
                </View>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteTask(task.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash2 color={Colors.error} size={18} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <View>
          <Text style={styles.title}>My Tasks</Text>
          <Text style={styles.subtitle}>
            {pendingTasks.length} pending, {completedTasks.length} completed
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[Colors.gradients.primary[0], Colors.gradients.primary[1]]}
            style={styles.addButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Plus color="white" size={24} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {tasks.length === 0 ? (
        <View style={styles.emptyState}>
          <CheckCircle color={Colors.light.textSecondary} size={64} />
          <Text style={styles.emptyTitle}>No tasks yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the + button to add your first task
          </Text>
        </View>
      ) : (
        <FlatList
          data={[...pendingTasks, ...completedTasks]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TaskItem task={item} />}
          contentContainerStyle={styles.tasksList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Task</Text>
            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
              style={styles.closeButton}
            >
              <X color={Colors.light.textSecondary} size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.textInput}
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                placeholder="Enter task title..."
                placeholderTextColor={Colors.light.textSecondary}
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newTaskDescription}
                onChangeText={setNewTaskDescription}
                placeholder="Add more details..."
                placeholderTextColor={Colors.light.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.optionsContainer}>
                {TASK_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.optionButton,
                      newTaskCategory === category && styles.optionButtonSelected,
                    ]}
                    onPress={() => {
                      if (category && category.trim()) {
                        setNewTaskCategory(category);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        newTaskCategory === category && styles.optionTextSelected,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.optionsContainer}>
                {TASK_PRIORITIES.map((priority) => (
                  <TouchableOpacity
                    key={priority.value}
                    style={[
                      styles.optionButton,
                      newTaskPriority === priority.value && styles.optionButtonSelected,
                    ]}
                    onPress={() => setNewTaskPriority(priority.value)}
                  >
                    <Flag color={priority.color} size={16} />
                    <Text
                      style={[
                        styles.optionText,
                        newTaskPriority === priority.value && styles.optionTextSelected,
                      ]}
                    >
                      {priority.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.createButton,
                !newTaskTitle.trim() && styles.createButtonDisabled,
              ]}
              onPress={handleAddTask}
              disabled={!newTaskTitle.trim()}
            >
              <LinearGradient
                colors={[Colors.gradients.primary[0], Colors.gradients.primary[1]]}
                style={styles.createButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Check color="white" size={20} />
                <Text style={styles.createButtonText}>Create Task</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingBottom: 20,
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
  addButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  addButtonGradient: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tasksList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  taskItem: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  taskLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkboxContainer: {
    marginTop: 2,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.light.textSecondary,
  },
  taskDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  taskDescriptionCompleted: {
    textDecorationLine: 'line-through',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: Colors.light.textSecondary,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pointsBadge: {
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pointsText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.accent,
  },
  deleteButton: {
    padding: 8,
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
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.backgroundSecondary,
    gap: 6,
  },
  optionButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  optionTextSelected: {
    color: 'white',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  createButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
