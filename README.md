# Spotify Controller

A web application that allows you to control your Spotify playback through a clean and simple interface.

## Overview

This Spotify Controller application provides an intuitive web interface for controlling your Spotify playback. It allows you to:
- View currently playing song information and album art
- Play, pause, and skip tracks
- Go back to previous tracks
- Display real-time playback information

## Prerequisites

To use this application, you will need:
- A Spotify account (Premium account recommended for full playback control)
- Registered Spotify API credentials (Client ID and Client Secret)

## Setup

1. **Register your application with Spotify**
   - Visit the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
   - Create a new application
   - Set a redirect URI (e.g., http://localhost:8888/callback)
   - Note your Client ID and Client Secret

2. **Configure the application**
   - Clone or download this repository
   - Open the application in your web browser
   - Enter your Client ID and Client Secret in the provided fields
   - Click "Auth" to authenticate with Spotify

## How to Use

1. After authentication, the application will display your currently playing track.
2. Use the playback control buttons to:
   - **Currently playing**: Refresh and display current playback information
   - **Previous**: Go back to the previous track
   - **Play**: Start playback
   - **Next**: Skip to the next track
   - **Pause**: Pause the current playback

## Technical Details

This application uses:
- HTML, CSS, and JavaScript for the frontend
- Spotify Web API for playback control and information retrieval
- OAuth 2.0 for authentication with Spotify

## Limitations

- Full playback control requires a Spotify Premium account
- The authentication token expires periodically and requires re-authentication


## License

This project is open source and available under the MIT License.
