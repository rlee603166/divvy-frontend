import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Search } from 'lucide-react-native';
import { friendTheme } from '../../theme';

const SearchBar = ({ value, onChangeText }) => (
  <View style={styles.container}>
    <Search width={20} height={20} color={friendTheme.colors.gray400} />
    <TextInput
      style={styles.input}
      placeholder="Search friends..."
      placeholderTextColor={friendTheme.colors.gray400}
      value={value}
      onChangeText={onChangeText}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: friendTheme.colors.gray50,
    borderRadius: 16,
    paddingHorizontal: friendTheme.spacing[4],
    paddingVertical: friendTheme.spacing[3],
    marginBottom: friendTheme.spacing[6],
  },
  input: {
    flex: 1,
    marginLeft: friendTheme.spacing[2],
    fontSize: 16,
    color: friendTheme.colors.gray900,
    padding: 0,
  },
});

export default SearchBar;
