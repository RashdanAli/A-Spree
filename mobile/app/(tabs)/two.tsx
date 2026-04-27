import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

const GET_MY_ORDERS = gql`
  query MyOrders($userId: ID!, $page: Int, $limit: Int) {
    myOrders(userId: $userId, page: $page, limit: $limit) {
      id
      status
      totalAmount
      orderType
      createdAt
      items {
        productId
        quantity
        unitPrice
      }
    }
  }
`;

interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  orderType: string;
  createdAt: string;
  items: OrderItem[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PLACED':
      return { bg: 'rgba(0,121,156,0.1)', text: '#005f7b' };
    case 'PROCESSING':
      return { bg: 'rgba(255,183,77,0.1)', text: '#e65100' };
    case 'READY':
    case 'OUT_FOR_DELIVERY':
      return { bg: 'rgba(63,155,191,0.1)', text: '#3F9BBF' };
    case 'DELIVERED':
      return { bg: 'rgba(0,95,59,0.1)', text: '#005f3b' };
    default:
      return { bg: 'rgba(93,95,95,0.1)', text: '#5d5f5f' };
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function OrdersScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const { data, loading, refetch } = useQuery<{ myOrders: Order[] }>(GET_MY_ORDERS, {
    variables: { userId: user?.email || '', page: 1, limit: 20 },
    skip: !user?.email,
  });

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

  const renderOrder = ({ item }: { item: Order }) => {
    const statusColors = getStatusColor(item.status);

    return (
      <TouchableOpacity style={styles.orderCard} activeOpacity={0.7}>
        <View style={styles.orderHeader}>
          <View style={styles.orderIdContainer}>
            <Text style={styles.orderIdLabel}>Order</Text>
            <Text style={styles.orderId}>#{item.id.slice(-8).toUpperCase()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {item.status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type</Text>
            <Text style={styles.detailValue}>{item.orderType}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Items</Text>
            <Text style={styles.detailValue}>{item.items?.length || 0} items</Text>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <View>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>${item.totalAmount?.toFixed(2) || '0.00'}</Text>
          </View>
          <View style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View Details</Text>
            <Text style={styles.viewButtonIcon}>chevron_right</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data?.myOrders || []}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>receipt_long</Text>
            </View>
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptySubtitle}>
              Your order history will appear here
            </Text>
            <TouchableOpacity style={styles.shopButton} activeOpacity={0.8}>
              <Text style={styles.shopButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafd',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
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
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#1b1c1c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  orderIdLabel: {
    fontSize: 12,
    color: '#8f8f8f',
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1b1c1c',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f1f4f7',
    paddingTop: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#8f8f8f',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1b1c1c',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f4f7',
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 11,
    color: '#8f8f8f',
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b1c1c',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7fafd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3F9BBF',
  },
  viewButtonIcon: {
    fontSize: 16,
    color: '#3F9BBF',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(63,155,191,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 36,
    color: '#3F9BBF',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1b1c1c',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8f8f8f',
    textAlign: 'center',
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#af101a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shopButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});