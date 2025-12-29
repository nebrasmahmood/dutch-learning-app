import React from "react";
import { View, StyleSheet, Image } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { AppColors, Spacing, BorderRadius } from "@/constants/theme";

interface HeaderTitleProps {
  title: string;
}

export function HeaderTitle({ title }: HeaderTitleProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>
      <ThemedText style={styles.title}>{title}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.xs,
    overflow: "hidden",
    marginRight: Spacing.sm,
  },
  icon: {
    width: 28,
    height: 28,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: AppColors.textDark,
  },
});
