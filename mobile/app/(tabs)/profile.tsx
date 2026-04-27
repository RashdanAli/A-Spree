import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { MaterialIcons } from '@expo/vector-icons';

const ROLE_LABELS: Record<string, string> = {
  CUSTOMER: 'Customer',
  SUPER_ADMIN: 'Super Admin',
  WAREHOUSE_MANAGER: 'Warehouse Manager',
  BRANCH_MANAGER: 'Branch Manager',
  CASHIER: 'Cashier',
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login' as any);
          },
        },
      ]
    );
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.displayName}>{user?.name || 'A-Spree User'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{ROLE_LABELS[user?.role ?? ''] ?? user?.role ?? 'Member'}</Text>
        </View>
      </View>

      {/* Info Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Details</Text>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MaterialIcons name="email" size={18} color="#af101a" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email ?? '—'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MaterialIcons name="badge" size={18} color="#af101a" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Role</Text>
              <Text style={styles.infoValue}>{ROLE_LABELS[user?.role ?? ''] ?? user?.role ?? '—'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
            <View style={styles.infoIcon}>
              <MaterialIcons name="notifications-none" size={18} color="#5d5f5f" />
            </View>
            <Text style={styles.actionLabel}>Notifications</Text>
            <MaterialIcons name="chevron-right" size={20} color="#c8c8c8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
            <View style={styles.infoIcon}>
              <MaterialIcons name="help-outline" size={18} color="#5d5f5f" />
            </View>
            <Text style={styles.actionLabel}>Help & Support</Text>
            <MaterialIcons name="chevron-right" size={20} color="#c8c8c8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
        <MaterialIcons name="logout" size={20} color="#af101a" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>A-Spree v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafd',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#af101a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#af101a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  displayName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1b1c1c',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: 'rgba(175,16,26,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#af101a',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8f8f8f',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#1b1c1c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f7fafd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#8f8f8f',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1b1c1c',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f4f7',
    marginHorizontal: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  actionLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1b1c1c',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: '#af101a',
    shadowColor: '#af101a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#af101a',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#c8c8c8',
    marginTop: 24,
  },
});