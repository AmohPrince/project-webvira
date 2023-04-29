import { faCamera, faSpinner, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { User } from "firebase/auth";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { PasswordEditor } from "../../Components/Dashboard/Settings/PasswordEditor";
import { SettingsInput } from "../../Components/Dashboard/Settings/SettingsInput";
import { ToolTip } from "../../Components/SignInOrSignUp/ToolTip";
import { SubmitButton } from "../../Components/SubmitButton";
import {
  updateUserDisplayName,
  updateUserEmailAddress,
} from "../../Firebase/firebase";
import { uploadUserProfilePicture } from "../../Firebase/storage";
import { useAuth } from "../../Hooks/UseAuth";
import { formatDateFromTimestamp } from "../../Util/Utilities";

export type Inputs = {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

type UserWithCreatedAt = User & {
  createdAt: string;
};

const Settings = () => {
  const { userCredential, setUserCredential } = useAuth();
  const fileInput = useRef<HTMLInputElement>(null);
  const profilePictureRef = useRef<HTMLImageElement>(null);
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<Inputs>();

  const user = userCredential?.user;

  const [activeTab, setActiveTab] = useState<
    "personal-information" | "password"
  >("personal-information");
  const [isUploadingUserProfilePic, setIsUploadingUserProfilePic] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChangingUserProfilePicture = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsUploadingUserProfilePic(true);
    const url = await uploadUserProfilePicture(
      e.target.files![0],
      userCredential!.user.uid
    )
      .then((url) => {
        setIsUploadingUserProfilePic(false);
        return url;
      })
      .catch((err) => {
        console.error(err);
        return null;
      });

    setUserCredential((userCredential) => {
      return {
        ...userCredential,
        user: {
          ...userCredential?.user,
          photoURL: url,
          emailVerified: userCredential!.user.emailVerified,
          isAnonymous: userCredential!.user.isAnonymous,
          metadata: userCredential!.user.metadata,
          providerData: userCredential!.user.providerData,
          refreshToken: userCredential!.user.refreshToken,
          tenantId: userCredential!.user.tenantId,
          delete: userCredential!.user.delete,
          getIdToken: userCredential!.user.getIdToken,
          getIdTokenResult: userCredential!.user.getIdTokenResult,
          reload: userCredential!.user.reload,
          toJSON: userCredential!.user.toJSON,
          displayName: userCredential!.user.displayName,
          email: userCredential!.user.email,
          phoneNumber: userCredential!.user.phoneNumber,
          providerId: userCredential!.user.providerId,
          uid: userCredential!.user.uid,
        },
        providerId: userCredential!.providerId,
        operationType: userCredential!.operationType,
      };
    });
  };

  const handleClick = () => {
    fileInput.current?.click();
  };

  const handleUpdateUserInformation = async (inputData: Inputs) => {
    try {
      setIsLoading(true);
      await updateUserDisplayName(
        inputData.firstName + " " + inputData.lastName
      );
      await updateUserEmailAddress(inputData.email);
      //TODO learn how to update user phone number
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-2/3 mx-auto mt-5 bg-white">
      <div className="flex font-semibold text-sm cursor-pointer">
        <p
          className={`py-4 w-1/2 text-center transition-colors ${
            activeTab === "personal-information"
              ? "text-white bg-primaryOne"
              : "text-primaryOne"
          }`}
          onClick={() => setActiveTab("personal-information")}
        >
          Personal Information
        </p>
        <p
          className={`py-4 w-1/2 text-center transition-colors ${
            activeTab === "password"
              ? "text-white bg-primaryOne"
              : "text-primaryOne"
          }`}
          onClick={() => setActiveTab("password")}
        >
          Password
        </p>
      </div>
      {activeTab === "personal-information" ? (
        <div className="p-5">
          {/* profile picture */}
          <div className="h-20 w-20 mx-auto relative">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user?.displayName + "`s profile picture"}
                className="z-0 h-full w-full rounded-full"
                ref={profilePictureRef}
              />
            ) : (
              <div className="p-5 bg-black h-full w-full rounded-full">
                <FontAwesomeIcon
                  icon={faUser}
                  className="z-0 h-full w-full text-white"
                />
              </div>
            )}
            {isUploadingUserProfilePic && (
              <div className="h-1/4 w-1/4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <FontAwesomeIcon
                  icon={faSpinner}
                  spin
                  className="text-white h-full"
                />
              </div>
            )}
            <div
              className="rounded-full w-7 h-7 bg-white flex shadow-sm shadow-primaryOne justify-center items-center cursor-pointer absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/3"
              onClick={handleClick}
            >
              <input
                type="file"
                hidden
                onChange={handleChangingUserProfilePicture}
                ref={fileInput}
              />
              <FontAwesomeIcon icon={faCamera} className="text-primaryOne" />
            </div>
          </div>
          <form
            onSubmit={handleSubmit(handleUpdateUserInformation)}
            className="flex flex-col"
          >
            <p className="text-xl font-bold">Personal information</p>
            {/* first name and last name  */}
            <div className="flex mt-5 gap-x-2">
              <div className="w-1/2">
                <p className="text-base font-medium">First Name</p>
                <p className="text-xs font-medium text-gray-400 my-1">
                  Enter your first name here
                </p>
                <SettingsInput
                  type="text"
                  regParam="firstName"
                  register={register}
                />
              </div>
              <div className="w-1/2">
                <p className="text-base font-medium">Last Name</p>
                <p className="text-xs font-medium text-gray-400 my-1">
                  Enter your last name here
                </p>
                <SettingsInput
                  type="text"
                  regParam="lastName"
                  register={register}
                />
              </div>
            </div>
            {/* email address and phone number */}
            <div className="flex mt-5 gap-x-2">
              <div className="w-1/2">
                <p className="text-base font-medium">Email address</p>
                <p className="text-xs font-medium text-gray-400 my-1">
                  Enter your email address here
                </p>
                <div className="relative w-full">
                  {errors.email && (
                    <ToolTip text="Email is invalid or incomplete" />
                  )}
                  <SettingsInput
                    type="email"
                    regParam="email"
                    register={register}
                    // eslint-disable-next-line no-useless-escape
                    pattern={/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/}
                  />
                </div>
              </div>
              <div className="w-1/2">
                <p className="text-base font-medium">Phone number</p>
                <p className="text-xs font-medium text-gray-400 my-1">
                  Enter your phone number here
                </p>
                <div className="relative w-full">
                  {errors.phoneNumber && (
                    <ToolTip text="Enter a valid phone number in international format (+254...)" />
                  )}
                  <SettingsInput
                    type="tel"
                    regParam="phoneNumber"
                    register={register}
                    pattern={/^\+(?:[0-9] ?){6,14}[0-9]$/}
                  />
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-5">
              This account was created on{" "}
              {formatDateFromTimestamp(
                parseInt((user as UserWithCreatedAt)?.createdAt)
              )}
            </p>
            <SubmitButton
              disabled={Object.keys(errors).length !== 0}
              isLoading={isLoading}
              text="Update details"
              className="ml-auto mt-5 w-1/4"
            />
          </form>
        </div>
      ) : (
        <PasswordEditor />
      )}
    </div>
  );
};

export default Settings;
