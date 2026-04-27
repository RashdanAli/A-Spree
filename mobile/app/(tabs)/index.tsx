import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

const GET_BRANCHES = gql`
  query branches {
    branches {
      id
      name
      address
    }
  }
`;

interface Branch {
  id: string;
  name: string;
  address: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const { data, loading, refetch } = useQuery<{ branches: Branch[] }>(GET_BRANCHES);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login' as any);
    }
  }, [isAuthenticated, router]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading branches...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Header */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.name || user?.email || 'Customer'}</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(175,16,26,0.1)' }]}>
              <Text style={styles.actionIconText}>store</Text>
            </View>
            <Text style={styles.actionLabel}>Browse</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(0,121,156,0.1)' }]}>
              <Text style={styles.actionIconText}>shopping_cart</Text>
            </View>
            <Text style={styles.actionLabel}>Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(0,95,123,0.1)' }]}>
              <Text style={styles.actionIconText}>receipt</Text>
            </View>
            <Text style={styles.actionLabel}>Orders</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Nearby Branches */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nearby Branches</Text>
        {(data?.branches?.length ?? 0) > 0 ? (
          data?.branches?.map((branch: Branch) => (
            <TouchableOpacity key={branch.id} style={styles.branchCard} activeOpacity={0.7}>
              <View style={styles.branchIcon}>
                <Text style={styles.branchIconText}>location_on</Text>
              </View>
              <View style={styles.branchInfo}>
                <Text style={styles.branchName}>{branch.name}</Text>
                <Text style={styles.branchAddress}>{branch.address}</Text>
              </View>
              <Text style={styles.chevron}>chevron_right</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No branches available</Text>
            <Text style={styles.emptySubtext}>Check back later for updates</Text>
          </View>
        )}
      </View>

      {/* Deals Banner */}
      <View style={styles.dealsBanner}>
        <View style={styles.dealsContent}>
          <Text style={styles.dealsTitle}>Fresh Deals</Text>
          <Text style={styles.dealsSubtitle}>Up to 30% off on selected items</Text>
        </View>
        <TouchableOpacity style={styles.dealsButton} activeOpacity={0.8}>
          <Text style={styles.dealsButtonText}>Shop Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafd',
  },
  contentContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7fafd',
  },
  loadingText: {
    fontSize: 14,
    color: '#8f8f8f',
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 14,
    color: '#5d5f5f',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1b1c1c',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1b1c1c',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#1b1c1c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIconText: {
    fontSize: 24,
    color: '#1b1c1c',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#5d5f5f',
  },
  branchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#1b1c1c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  branchIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(63, 155, 191, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  branchIconText: {
    fontSize: 20,
    color: '#3F9BBF',
  },
  branchInfo: {
    flex: 1,
  },
  branchName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1b1c1c',
  },
  branchAddress: {
    fontSize: 12,
    color: '#8f8f8f',
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: '#8f8f8f',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5d5f5f',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#8f8f8f',
    marginTop: 4,
  },
  dealsBanner: {
    backgroundColor: '#af101a',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  dealsContent: {
    flex: 1,
  },
  dealsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  dealsSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  dealsButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  dealsButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#af101a',
  },
});