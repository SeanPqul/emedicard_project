// Navigation Types
export interface NavigationProp {
  navigate: <RouteName extends string>(screen: RouteName, params?: Record<string, unknown>) => void;
  goBack: () => void;
  push: <RouteName extends string>(screen: RouteName, params?: Record<string, unknown>) => void;
  replace: <RouteName extends string>(screen: RouteName, params?: Record<string, unknown>) => void;
  reset: (state: any) => void;
  canGoBack: () => boolean;
}

export interface RouteProp<T = Record<string, unknown>> {
  params?: T;
  name: string;
  key: string;
}

export interface ScreenProps<TParams = Record<string, unknown>> {
  navigation: NavigationProp;
  route: RouteProp<TParams>;
}
