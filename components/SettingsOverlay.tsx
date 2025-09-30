import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

interface MenuItem {
  id: string;
  label: string;
  onPress: () => void;
}

export default function SettingsOverlay() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { logout } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const closeMenu = () => setIsVisible(false);

  const handleLogout = async () => {
    try {
      setIsProcessing(true);
      await logout();
      closeMenu();
      Alert.alert('Sesion cerrada', 'Vuelve pronto, tu progreso te estara esperando.');
    } catch (error) {
      Alert.alert('No se pudo cerrar sesion', error instanceof Error ? error.message : 'Intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComingSoon = (label: string) => {
    Alert.alert(label, 'Esta seccion estara disponible muy pronto.');
  };

  const menuItems: MenuItem[] = useMemo(
    () => [
      { id: 'settings', label: 'Ajustes', onPress: () => handleComingSoon('Ajustes') },
      { id: 'logout-shortcut', label: 'Cerrar sesion', onPress: handleLogout },
      { id: 'activity', label: 'Actividad', onPress: () => handleComingSoon('Actividad') },
      { id: 'notifications', label: 'Notificaciones', onPress: () => handleComingSoon('Notificaciones') },
      { id: 'usage', label: 'Tiempo de uso', onPress: () => handleComingSoon('Tiempo de uso') },
      { id: 'accessibility', label: 'Accesibilidad', onPress: () => handleComingSoon('Accesibilidad') },
      { id: 'support', label: 'Ayuda', onPress: () => router.push('/professional-help') },
      { id: 'privacy', label: 'Centro de privacidad', onPress: () => handleComingSoon('Centro de privacidad') },
      { id: 'about', label: 'About', onPress: () => handleComingSoon('About') },
      { id: 'add-account', label: 'Anadir cuenta', onPress: () => handleComingSoon('Anadir cuenta') },
      { id: 'logout', label: 'Cerrar sesion', onPress: handleLogout },
    ],
    []
  );

  const handleItemPress = (item: MenuItem) => {
    closeMenu();
    setTimeout(() => item.onPress(), 120);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, { top: top + 12 }]}
        activeOpacity={0.8}
        onPress={() => setIsVisible(true)}
      >
        <View style={styles.bar} />
        <View style={styles.bar} />
        <View style={styles.bar} />
      </TouchableOpacity>

      <Modal transparent visible={isVisible} animationType="fade" onRequestClose={closeMenu}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeMenu} />
        <View style={[styles.panel, { top: top + 54 }]}>
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleItemPress(item)}
              disabled={isProcessing && item.id.startsWith('logout')}
            >
              <Text style={styles.menuText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    position: 'absolute',
    right: 20,
    zIndex: 50,
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#ffffffdd',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  bar: {
    width: 22,
    height: 2,
    borderRadius: 999,
    backgroundColor: Colors.light.text,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
  },
  panel: {
    position: 'absolute',
    right: 16,
    width: 220,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 12,
    shadowColor: '#0f172a',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  menuText: {
    fontSize: 15,
    color: Colors.light.text,
    fontWeight: '600',
  },
});
