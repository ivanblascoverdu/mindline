import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Star, 
  AlertTriangle,
  Heart,
  Users,
  MessageCircle
} from 'lucide-react-native';
import { emergencyContacts, professionalContacts } from '@/mocks/professional-help';
import { ProfessionalContact, EmergencyContact } from '@/types/professional-help';
import Colors from '@/constants/colors';

type FilterType = 'all' | 'psychologist' | 'therapist' | 'ngo' | 'crisis_line';

export default function ProfessionalHelpScreen() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const insets = useSafeAreaInsets();

  const filteredContacts = professionalContacts.filter(contact => 
    selectedFilter === 'all' || contact.type === selectedFilter
  );

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleWebsite = (website: string) => {
    Linking.openURL(website);
  };

  const handleEmergencyCall = (contact: EmergencyContact) => {
    Alert.alert(
      'Emergency Contact',
      `Call ${contact.name}?\n\n${contact.description}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Now', onPress: () => handleCall(contact.phone), style: 'destructive' },
      ]
    );
  };

  const renderEmergencyContact = (contact: EmergencyContact) => (
    <TouchableOpacity
      key={contact.id}
      style={styles.emergencyCard}
      onPress={() => handleEmergencyCall(contact)}
      testID={`emergency-contact-${contact.id}`}
    >
      <View style={styles.emergencyHeader}>
        <AlertTriangle color="#FF4444" size={24} />
        <View style={styles.emergencyInfo}>
          <Text style={styles.emergencyName}>{contact.name}</Text>
          <Text style={styles.emergencyPhone}>{contact.phone}</Text>
        </View>
        {contact.available24h && (
          <View style={styles.available24Badge}>
            <Text style={styles.available24Text}>24/7</Text>
          </View>
        )}
      </View>
      <Text style={styles.emergencyDescription}>{contact.description}</Text>
    </TouchableOpacity>
  );

  const renderProfessionalContact = (contact: ProfessionalContact) => (
    <View key={contact.id} style={styles.contactCard}>
      <View style={styles.contactHeader}>
        {contact.image ? (
          <Image source={{ uri: contact.image }} style={styles.contactImage} />
        ) : (
          <View style={[styles.contactImage, styles.placeholderImage]}>
            <Users color={Colors.light.tabIconDefault} size={32} />
          </View>
        )}
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{contact.name}</Text>
          <Text style={styles.contactTitle}>{contact.title}</Text>
          <Text style={styles.contactLocation}>
            <MapPin size={14} color={Colors.light.tabIconDefault} /> {contact.location}
          </Text>
          {contact.rating && (
            <View style={styles.ratingContainer}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={styles.rating}>{contact.rating}</Text>
              <Text style={styles.reviewCount}>({contact.reviewCount} reviews)</Text>
            </View>
          )}
        </View>
        <View style={[
          styles.availabilityBadge,
          { backgroundColor: contact.availability === 'available' ? '#4CAF50' : 
                            contact.availability === 'busy' ? '#FF9800' : '#F44336' }
        ]}>
          <Text style={styles.availabilityText}>
            {contact.availability === 'available' ? 'Available' :
             contact.availability === 'busy' ? 'Busy' : 'Unavailable'}
          </Text>
        </View>
      </View>

      <Text style={styles.contactDescription}>{contact.description}</Text>

      <View style={styles.specializationContainer}>
        {contact.specialization.map((spec) => (
          <View key={spec} style={styles.specializationTag}>
            <Text style={styles.specializationText}>{spec}</Text>
          </View>
        ))}
      </View>

      <View style={styles.languagesContainer}>
        <Text style={styles.languagesLabel}>Languages: </Text>
        <Text style={styles.languagesText}>{contact.languages.join(', ')}</Text>
      </View>

      <View style={styles.contactActions}>
        {contact.phone && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleCall(contact.phone!)}
            testID={`call-${contact.id}`}
          >
            <Phone size={18} color="white" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>
        )}
        {contact.email && (
          <TouchableOpacity
            style={[styles.actionButton, styles.emailButton]}
            onPress={() => handleEmail(contact.email!)}
            testID={`email-${contact.id}`}
          >
            <Mail size={18} color={Colors.light.tint} />
            <Text style={[styles.actionButtonText, styles.emailButtonText]}>Email</Text>
          </TouchableOpacity>
        )}
        {contact.website && (
          <TouchableOpacity
            style={[styles.actionButton, styles.websiteButton]}
            onPress={() => handleWebsite(contact.website!)}
            testID={`website-${contact.id}`}
          >
            <Globe size={18} color={Colors.light.tint} />
            <Text style={[styles.actionButtonText, styles.websiteButtonText]}>Website</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const filters = [
    { key: 'all' as FilterType, label: 'All', icon: Users },
    { key: 'psychologist' as FilterType, label: 'Psychologists', icon: Heart },
    { key: 'therapist' as FilterType, label: 'Therapists', icon: MessageCircle },
    { key: 'ngo' as FilterType, label: 'Organizations', icon: Users },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Professional Help</Text>
          <Text style={styles.subtitle}>
            Connect with mental health professionals and support organizations
          </Text>
        </View>

        <View style={styles.emergencySection}>
          <Text style={styles.sectionTitle}>
            <AlertTriangle size={20} color="#FF4444" /> Emergency Contacts
          </Text>
          <Text style={styles.emergencyNote}>
            If you&apos;re in crisis or having thoughts of self-harm, please reach out immediately:
          </Text>
          {emergencyContacts.map(renderEmergencyContact)}
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Find Professional Help</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            {filters.map((filter) => {
              const IconComponent = filter.icon;
              return (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterButton,
                    selectedFilter === filter.key && styles.filterButtonActive
                  ]}
                  onPress={() => setSelectedFilter(filter.key)}
                  testID={`filter-${filter.key}`}
                >
                  <IconComponent 
                    size={18} 
                    color={selectedFilter === filter.key ? 'white' : Colors.light.tint} 
                  />
                  <Text style={[
                    styles.filterButtonText,
                    selectedFilter === filter.key && styles.filterButtonTextActive
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.contactsSection}>
          {filteredContacts.map(renderProfessionalContact)}
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            This information is provided for educational purposes only and should not replace professional medical advice. 
            Always consult with qualified healthcare providers for proper diagnosis and treatment.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
    lineHeight: 22,
  },
  emergencySection: {
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyNote: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    marginBottom: 16,
    lineHeight: 20,
  },
  emergencyCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF4444',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emergencyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  emergencyName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  emergencyPhone: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF4444',
    marginTop: 2,
  },
  available24Badge: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  available24Text: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emergencyDescription: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    lineHeight: 18,
  },
  filterSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  filterContainer: {
    marginTop: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: Colors.light.tint,
    marginRight: 12,
  },
  filterButtonActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  filterButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  filterButtonTextActive: {
    color: 'white',
  },
  contactsSection: {
    paddingHorizontal: 24,
  },
  contactCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  contactHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  contactImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  contactTitle: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactLocation: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginLeft: 4,
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  availabilityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  contactDescription: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    lineHeight: 20,
    marginBottom: 16,
  },
  specializationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  specializationTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  specializationText: {
    fontSize: 12,
    color: Colors.light.tint,
    fontWeight: '500',
  },
  languagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  languagesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  languagesText: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  emailButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: Colors.light.tint,
  },
  websiteButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: Colors.light.tint,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  emailButtonText: {
    color: Colors.light.tint,
  },
  websiteButtonText: {
    color: Colors.light.tint,
  },
  disclaimer: {
    padding: 24,
    paddingTop: 16,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    lineHeight: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});