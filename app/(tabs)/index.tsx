import { Link } from "expo-router";
import { View } from "react-native";
import { styles } from "../../assets/styles/tabs-styles/dashboard";

export default function Index() {
  return (
    <View style={styles.container}>
      <Link href={"/profile"}>visit profile screen</Link>
    </View>
  );
}