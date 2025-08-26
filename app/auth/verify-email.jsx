import {View, Text, KeyboardAvoidingView, Platform, ScrollView, Image, TextInput, Alert, TouchableOpacity} from 'react-native'
import { authStyles } from '../../assets/styles/auth.styles';
import { COLORS } from "../../constants/colors";
import { useSignUp } from '@clerk/clerk-expo';
import { useState } from 'react';
import { router } from 'expo-router';

const VerifyEmail = ({email,onBack}) => {

    const {isLoaded, signUp, setActive} = useSignUp();
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);

    const handleVerification = async () => {
        if(!isLoaded) return;
        setLoading(true);
        try {
            const signUpAttempt=await signUp.attemptEmailAddressVerification({code});
            if(signUpAttempt.status === "complete"){
                await setActive({session: signUpAttempt.createdSessionId});
            }else{
                Alert.alert("Error", "Verification failed. Please try again.");
                console.error(JSON.stringify(signUpAttempt, null, 2));
            }
        } catch (err) {
            Alert.alert("Error", err.errors?.[0]?.message || "Verification failed");
            console.error(JSON.stringify(err, null, 2));
        }finally{
                setLoading(false);
        }
    }
    return (
        <View style={authStyles.container}>
            <KeyboardAvoidingView
                    style={authStyles.keyboardView}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "android" ? 64 : Platform.OS === "ios" ? 40 : 0}>
                <ScrollView
                    contentContainerStyle={authStyles.scrollContext}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={authStyles.imageContainer}>
                        <Image
                            source={require("../../assets/images/i3.png")}
                            style={authStyles.image}
                            contentFit="contain"
                        ></Image>
                    </View>
                    <Text style={authStyles.title}>Verify Your Email</Text>
                    <Text style={authStyles.subtitle}>We have sent a verification code to {email}.</Text>
                    <View style={authStyles.formContainer}>
                        {/*Verification Code Input*/}
                        <View style={authStyles.inputContainer}>
                            <TextInput
                                style={authStyles.textInput}
                                placeholder='Enter Verification Code'
                                placeholderTextColor={COLORS.textLight}
                                value={code}
                                onChangeText={setCode}
                                keyboardType='number-pad'
                                autoCapitalize='none'
                            />
                        {/* verify button*/}
                        <TouchableOpacity
                                style={[authStyles.authButton, loading && authStyles.buttonDisabled]}
                                onPress={handleVerification}
                                disabled={loading}
                                activeOpacity={0.8}>
                                <Text style={authStyles.buttonText}>{loading ? "Verifying..." : "Verify Email"}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={authStyles.linkContainer}
                            onPress={onBack}
                        >
                            <Text style={authStyles.linkText}>
                                <Text style={authStyles.link}>Back to Sign Up</Text>
                            </Text>
                        </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    )
}

export default VerifyEmail;