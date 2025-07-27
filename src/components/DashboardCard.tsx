import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  title: string;
  subtitle: string;
}

const DashboardCard: React.FC<Props> = ({ title, subtitle }) => (
  <View style={styles.card}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>{subtitle}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  title: { fontWeight: 'bold', fontSize: 16 },
  subtitle: { fontSize: 14, marginTop: 4 },
});

export default DashboardCard;
