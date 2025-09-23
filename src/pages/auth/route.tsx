import { RouteDefinition } from 'solid-app-router'
import AuthPage from './auth'

const authRoute: RouteDefinition = {
  path: '/auth-v1',                           
  component: AuthPage,
}

export default authRoute
