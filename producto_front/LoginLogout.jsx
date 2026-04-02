import { useAuth0 } from "@auth0/auth0-react";
import { use } from "react";

export const Login = () => {
    const{loginWithRedirect} = useAuth0()
    const click = () => {loginWithRedirect();}
    return(<><button onClick={click}>Login</button></>)
}

export const Logout = () => {
    const{logout} = useAuth0()
    return(<><button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>Logout</button></>)
}