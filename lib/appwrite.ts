import {Account, Avatars, Client, OAuthProvider} from "react-native-appwrite"
import * as Linking from 'expo-linking'
import {openAuthSessionAsync} from "expo-web-browser";
import {Databases} from "appwrite";

export const config = {
    platform:'com.jrc.reestate',
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
}

export const client = new Client();
export const databases = new Databases(client);

client
    .setEndpoint(config.endpoint!)
    .setProject(config.projectId!)
    .setPlatform(config.platform!)

export const avatar = new Avatars(client);
export const account = new Account(client);

export async function login(){
    try{
        const redirectUri = Linking.createURL('/');
        const response = await account.createOAuth2Token(OAuthProvider.Google,redirectUri);
        if(!response)throw new Error('failed to login1');

        const browserResult = await openAuthSessionAsync(response.toString(),redirectUri);
        if(browserResult.type != 'success') throw new Error('failed to login2');

        const url = new URL(browserResult.url);
        const secret = url.searchParams.get('secret')?.toString();
        const userId = url.searchParams.get('userId')?.toString();
        if(!secret || !userId)throw new Error('failed to login3');

        const session = await account.createSession(userId, secret);
        if(!session)throw new Error('failed to create a session');
        return true;
    }catch(error){
        console.error(error);
        return false;
    }
}

export async function loginWithEmail(email, password){
    try {
        const session = await account.createEmailPasswordSession(email, password);
        if (session) {
            return true;
        }
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function signupWithEmail(email, password, name){
    try {
        const newUser = await account.create('unique()', email, password);
        return newUser;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function logout(){
    try{
        await account.deleteSession('current');
        return true;
    }catch(error){
        console.error(error);
        return false;
    }
}

export async function getCurrentUser(){
    try{
        const response = await account.get();
        if(response.$id){
            const userAvatar = avatar.getInitials(response.name);
            return {
                ...response,
                avatar: userAvatar.toString(),
            };
        }
    }catch(error){
        console.error(error);
        return false;
    }
}
