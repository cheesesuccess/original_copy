import { RouteDefinition } from 'solid-app-router'
import AuthPage from './auth'

const authRoute: RouteDefinition = {
  path: '/auth',                           
  component: AuthPage,
}

export default authRoute
