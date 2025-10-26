import { Text, View } from 'react-native';

export const EditScreenInfo = ({ path }: { path: string }) => {
  const title = 'Open up the code for this screen:';
  const description =
    'Change any of the text, save the file, and your app will automatically update.';

  return (
    <View>
      <View className="color-red-900">
        <Text className="color-red-900">{title}</Text>
        <View className="color-red-900">
          <Text>{path}</Text>
        </View>
        <Text className="color-red-900">{description}</Text>
      </View>
    </View>
  );
};

