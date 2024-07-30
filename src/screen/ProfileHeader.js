import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const ProfileHeader = ({
  imageUrl,
  username,
  userType,
  isCurrentUser,
  onEditPress,
  onMessagePress,
  onFollowPress,
  isFollowing,
  city,
  country,
  phoneNumber,
  bio,
  changeSlopeColor,
  slopeColor
}) => (
  <View style={styles.profileContainer}>
    <View style={[styles.slope, { backgroundColor: slopeColor }]}>
      <TouchableOpacity style={styles.changeColorButton} onPress={changeSlopeColor}>
        <Icon name="paint-brush" size={20} color="#fff" />
      </TouchableOpacity>
      <View style={styles.profileImageContainer}>
        <Image style={styles.profileImage} source={imageUrl ? { uri: imageUrl } : require('../pic/avtar.png')} />
        <Text style={styles.userName}>{username}</Text>
      </View>
    </View>
    {!isCurrentUser && (
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="chevron-left" size={25} color="#000" />
      </TouchableOpacity>
    )}
    <View style={styles.profileContent}>
      <View style={styles.userInfoContainer}>
        {userType && (
          <View style={styles.userTypeContainer}>
            <Text style={styles.userType}>{userType}</Text>
            {isCurrentUser && (
              <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
                <Icon name="edit" size={20} color="#000" />
              </TouchableOpacity>
            )}
          </View>
        )}
        <View style={styles.locationContainer}>
          {city && <Text style={styles.locationText}>{city}</Text>}
          {country && (
            <>
              <Text style={styles.locationSeparator}>|</Text>
              <Text style={styles.locationText}>{country}</Text>
            </>
          )}
        </View>
        {phoneNumber && <Text style={styles.userInfoText}>Phone: {phoneNumber}</Text>}
        {bio && <Text style={styles.bioText}>Bio: {bio}</Text>}
        {!isCurrentUser && (
          <>
            <TouchableOpacity style={styles.messageButton} onPress={onMessagePress}>
              <Icon name="envelope" size={25} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.followButton} onPress={onFollowPress}>
              <Text style={styles.followButtonText}>{isFollowing ? "Unfollow" : "Follow"}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  profileContainer: {
    paddingHorizontal: 5,
    paddingVertical: 0,
    backgroundColor: '#fff',
  },
  slope: {
    height: 140,
    borderBottomLeftRadius: 160,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  changeColorButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  profileImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#fff',
    marginBottom: 1,
  },
  userName: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  backButton: {
    padding: 10,
  },
  profileContent: {
    marginTop: 6,
  },
  userInfoContainer: {
    paddingHorizontal: 10,
    marginBottom: 0,
  },
  userTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userType: {
    fontSize: 18,
    color: '#666',
  },
  editButton: {
    right: 260,
    paddingHorizontal: 0,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  locationText: {
    fontSize: 16,
    color: '#444',
  },
  locationSeparator: {
    fontSize: 16,
    color: '#444',
    marginHorizontal: 5,
  },
  userInfoText: {
    fontSize: 16,
    color: '#444',
    marginTop: 5,
  },
  bioText: {
    fontSize: 16,
    color: '#444',
    marginTop: 10,
    marginBottom: 15,
  },
  messageButton: {
    marginTop: 10,
    backgroundColor: '#2e64e5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  followButton: {
    marginTop: 10,
    backgroundColor: '#2e64e5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  followButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ProfileHeader;
