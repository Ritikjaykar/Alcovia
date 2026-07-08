import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { Colors } from "@/constants/Colors";
import { haptic } from "@/utils/feedback";

function TabButton({ children, onPress, style, ...props }: any) {
  return <Pressable {...props} style={style} android_ripple={{ color: "transparent" }} onPress={(event) => { haptic.selection(); onPress?.(event); }}>{children}</Pressable>;
}
export default function TabLayout(){return <Tabs detachInactiveScreens={false} screenOptions={{headerShown:false,lazy:false,animation:"fade",tabBarButton:(props)=><TabButton {...props}/>,tabBarActiveTintColor:Colors.primary,tabBarInactiveTintColor:Colors.textTertiary,tabBarLabelStyle:{fontFamily:"Inter_500Medium",fontSize:10},tabBarStyle:{backgroundColor:Colors.surface,borderTopColor:Colors.border,borderTopWidth:1,paddingTop:8,height:83}}}>
<Tabs.Screen name="index" options={{title:"Dashboard",tabBarIcon:({color,size})=><Ionicons name="grid-outline" size={size} color={color}/>}}/>
<Tabs.Screen name="history" options={{title:"History",tabBarIcon:({color,size})=><Ionicons name="time-outline" size={size} color={color}/>}}/>
<Tabs.Screen name="achievements" options={{title:"Achievements",tabBarIcon:({color,size})=><Ionicons name="star-outline" size={size} color={color}/>}}/>
</Tabs>}


