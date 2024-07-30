import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const StatsSection = ({ followersCount, followingCount, postsCount, onFollowersPress, onFollowingPress }) => (
  <View style={styles.statsContainer}>
    <TouchableOpacity onPress={onFollowersPress}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{followersCount}</Text>
        <Text style={styles.statLabel}>Followers</Text>
      </View>
    </TouchableOpacity>
    <TouchableOpacity onPress={onFollowingPress}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{followingCount}</Text>
        <Text style={styles.statLabel}>Following</Text>
      </View>
    </TouchableOpacity>
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{postsCount}</Text>
      <Text style={styles.statLabel}>Posts</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
});

export default StatsSection;
