// components/profile/BalanceSummary.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ArrowUp, ArrowDown } from "lucide-react-native";
import { profileTheme } from "../../theme";

const BalanceSummary = ({ balance }) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <ArrowUp width={16} height={16} color={profileTheme.colors.green} />
          <Text style={styles.label}>To Receive</Text>
        </View>
        <Text style={styles.amount}>${balance.toReceive}</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <ArrowDown width={16} height={16} color={profileTheme.colors.red} />
          <Text style={styles.label}>To Pay</Text>
        </View>
        <Text style={styles.amount}>${balance.toPay}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: profileTheme.spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: profileTheme.colors.background,
    padding: profileTheme.spacing.md,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: profileTheme.spacing.xs,
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: profileTheme.colors.secondary,
  },
  amount: {
    fontSize: 24,
    fontWeight: "500",
    color: profileTheme.colors.text,
  },
});

export default BalanceSummary;
