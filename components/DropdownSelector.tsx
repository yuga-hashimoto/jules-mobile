import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { Menu, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

export interface DropdownOption {
  label: string;
  value: string | null;
}

interface DropdownSelectorProps {
  value: string | null;
  options: DropdownOption[];
  onSelect: (value: string | null) => void;
  placeholder?: string;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  iconSize?: number;
  chevronSize?: number;
  showCheckmark?: boolean;
}

export const DropdownSelector: React.FC<DropdownSelectorProps> = ({
  value,
  options,
  onSelect,
  placeholder,
  iconName,
  style,
  textStyle,
  iconSize = 16,
  chevronSize = 18,
  showCheckmark = true,
}) => {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      contentStyle={{ backgroundColor: theme.colors.surfaceVariant }}
      anchor={
        <TouchableOpacity
          onPress={() => setVisible(true)}
          style={[
            styles.selector,
            { backgroundColor: theme.colors.surface, borderColor: Colors.jules.border },
            style,
          ]}
        >
          {iconName && (
            <MaterialCommunityIcons
              name={iconName}
              size={iconSize}
              color={Colors.jules.textSecondary}
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            style={[
              styles.selectorText,
              { color: value !== null ? theme.colors.onSurface : theme.colors.onSurfaceVariant },
              textStyle,
            ]}
            numberOfLines={1}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
          <MaterialCommunityIcons
            name={visible ? 'chevron-up' : 'chevron-down'}
            size={chevronSize}
            color={Colors.jules.textSecondary}
          />
        </TouchableOpacity>
      }
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <Menu.Item
            key={option.value ?? 'null'}
            onPress={() => {
              onSelect(option.value);
              setVisible(false);
            }}
            title={option.label}
            titleStyle={{
              color: showCheckmark && isSelected ? Colors.jules.primary : theme.colors.onSurface,
            }}
            trailingIcon={showCheckmark && isSelected ? 'check' : undefined}
          />
        );
      })}
    </Menu>
  );
};

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  selectorText: {
    flex: 1,
    fontSize: 14,
  },
});
