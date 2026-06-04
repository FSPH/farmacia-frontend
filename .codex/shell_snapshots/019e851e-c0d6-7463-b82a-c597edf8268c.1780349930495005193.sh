# Snapshot file
# Unset all aliases to avoid conflicts with functions
# Functions
gawklibpath_append () 
{ 
    [ -z "$AWKLIBPATH" ] && AWKLIBPATH=`gawk 'BEGIN {print ENVIRON["AWKLIBPATH"]}'`;
    export AWKLIBPATH="$AWKLIBPATH:$*"
}
gawklibpath_default () 
{ 
    unset AWKLIBPATH;
    export AWKLIBPATH=`gawk 'BEGIN {print ENVIRON["AWKLIBPATH"]}'`
}
gawklibpath_prepend () 
{ 
    [ -z "$AWKLIBPATH" ] && AWKLIBPATH=`gawk 'BEGIN {print ENVIRON["AWKLIBPATH"]}'`;
    export AWKLIBPATH="$*:$AWKLIBPATH"
}
gawkpath_append () 
{ 
    [ -z "$AWKPATH" ] && AWKPATH=`gawk 'BEGIN {print ENVIRON["AWKPATH"]}'`;
    export AWKPATH="$AWKPATH:$*"
}
gawkpath_default () 
{ 
    unset AWKPATH;
    export AWKPATH=`gawk 'BEGIN {print ENVIRON["AWKPATH"]}'`
}
gawkpath_prepend () 
{ 
    [ -z "$AWKPATH" ] && AWKPATH=`gawk 'BEGIN {print ENVIRON["AWKPATH"]}'`;
    export AWKPATH="$*:$AWKPATH"
}

# setopts 3
set -o braceexpand
set -o hashall
set -o interactive-comments

# aliases 0

# exports 70
declare -x APPLICATION_INSIGHTS_NO_STATSBEAT="true"
declare -x CHROME_DESKTOP="code.desktop"
declare -x CINNAMON_VERSION="6.6.7"
declare -x CLUTTER_IM_MODULE="ibus"
declare -x CODEX_HOME="/home/ovidio-neto/farmacia/.codex"
declare -x CODEX_INTERNAL_ORIGINATOR_OVERRIDE="codex_vscode"
declare -x DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/1000/bus"
declare -x DEBUG="release"
declare -x DESKTOP_SESSION="cinnamon-wayland"
declare -x DISPLAY=":0"
declare -x ELECTRON_RUN_AS_NODE="1"
declare -x FC_FONTATIONS="1"
declare -x GDK_BACKEND="wayland"
declare -x GDMSESSION="cinnamon-wayland"
declare -x GDM_LANG="pt_BR"
declare -x GIO_LAUNCHED_DESKTOP_FILE="/usr/share/applications/code.desktop"
declare -x GIO_LAUNCHED_DESKTOP_FILE_PID="877513"
declare -x GJS_DEBUG_OUTPUT="stderr"
declare -x GJS_DEBUG_TOPICS="JS ERROR;JS LOG"
declare -x GNOME_DESKTOP_SESSION_ID="this-is-deprecated"
declare -x GNOME_SETUP_DISPLAY=":1"
declare -x GPG_AGENT_INFO="/run/user/1000/gnupg/S.gpg-agent:0:1"
declare -x GTK3_MODULES="xapp-gtk3-module"
declare -x GTK_IM_MODULE="ibus"
declare -x GTK_MODULES="gail:atk-bridge"
declare -x HOME="/home/ovidio-neto"
declare -x IM_CONFIG_CHECK_ENV="1"
declare -x IM_CONFIG_PHASE="1"
declare -x LANG="pt_BR.UTF-8"
declare -x LANGUAGE="pt_BR:pt:en"
declare -x LESSCLOSE="/usr/bin/lesspipe %s %s"
declare -x LESSOPEN="| /usr/bin/lesspipe %s"
declare -x LOGNAME="ovidio-neto"
declare -x NVM_BIN="/home/ovidio-neto/.nvm/versions/node/v24.14.1/bin"
declare -x NVM_DIR="/home/ovidio-neto/.nvm"
declare -x NVM_INC="/home/ovidio-neto/.nvm/versions/node/v24.14.1/include/node"
declare -x PATH="/home/ovidio-neto/farmacia/.codex/tmp/arg0/codex-arg0B6uBWU:/home/ovidio-neto/.nvm/versions/node/v24.14.1/bin:/home/ovidio-neto/.agents/shims:/home/ovidio-neto/.nvm/versions/node/v24.14.1/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:/home/ovidio-neto/.vscode/extensions/openai.chatgpt-26.527.60818-linux-x64/bin/linux-x86_64"
declare -x QT_ACCESSIBILITY="1"
declare -x QT_IM_MODULE="ibus"
declare -x QT_IM_MODULES="wayland;ibus"
declare -x RUST_LOG="warn"
declare -x SESSION_MANAGER="local/home:@/tmp/.ICE-unix/1742,unix/home:/tmp/.ICE-unix/1742"
declare -x SHELL="/bin/bash"
declare -x SHLVL="1"
declare -x SSH_AUTH_SOCK="/run/user/1000/keyring/ssh"
declare -x USER="ovidio-neto"
declare -x VSCODE_CODE_CACHE_PATH="/home/ovidio-neto/.config/Code/CachedData/8761a5560cfd65fdd19ce7e2bd18dab5c0a4d84e"
declare -x VSCODE_CRASH_REPORTER_PROCESS_TYPE="extensionHost"
declare -x VSCODE_CWD="/home/ovidio-neto"
declare -x VSCODE_ESM_ENTRYPOINT="vs/workbench/api/node/extensionHostProcess"
declare -x VSCODE_HANDLES_UNCAUGHT_ERRORS="true"
declare -x VSCODE_IPC_HOOK="/run/user/1000/vscode-8cf6ab64-1.12-main.sock"
declare -x VSCODE_NLS_CONFIG="{\"userLocale\":\"pt-br\",\"osLocale\":\"pt-br\",\"resolvedLanguage\":\"pt-br\",\"defaultMessagesFile\":\"/usr/share/code/resources/app/out/nls.messages.json\",\"languagePack\":{\"translationsConfigFile\":\"/home/ovidio-neto/.config/Code/clp/8089f552ccfb11d1dcff89d5ed5444fc.pt-br/tcf.json\",\"messagesFile\":\"/home/ovidio-neto/.config/Code/clp/8089f552ccfb11d1dcff89d5ed5444fc.pt-br/8761a5560cfd65fdd19ce7e2bd18dab5c0a4d84e/nls.messages.json\",\"corruptMarkerFile\":\"/home/ovidio-neto/.config/Code/clp/8089f552ccfb11d1dcff89d5ed5444fc.pt-br/corrupted.info\"},\"locale\":\"pt-br\",\"availableLanguages\":{\"*\":\"pt-br\"},\"_languagePackId\":\"8089f552ccfb11d1dcff89d5ed5444fc.pt-br\",\"_languagePackSupport\":true,\"_translationsConfigFile\":\"/home/ovidio-neto/.config/Code/clp/8089f552ccfb11d1dcff89d5ed5444fc.pt-br/tcf.json\",\"_cacheRoot\":\"/home/ovidio-neto/.config/Code/clp/8089f552ccfb11d1dcff89d5ed5444fc.pt-br\",\"_resolvedLanguagePackCoreLocation\":\"/home/ovidio-neto/.config/Code/clp/8089f552ccfb11d1dcff89d5ed5444fc.pt-br/8761a5560cfd65fdd19ce7e2bd18dab5c0a4d84e\",\"_corruptedFile\":\"/home/ovidio-neto/.config/Code/clp/8089f552ccfb11d1dcff89d5ed5444fc.pt-br/corrupted.info\"}"
declare -x VSCODE_PID="877513"
declare -x WAYLAND_DISPLAY="wayland-0"
declare -x XAUTHORITY="/run/user/1000/.muffin-Xwaylandauth.D6R7P3"
declare -x XDG_CONFIG_DIRS="/etc/xdg/xdg-cinnamon-wayland:/etc/xdg"
declare -x XDG_CURRENT_DESKTOP="X-Cinnamon"
declare -x XDG_DATA_DIRS="/usr/share/cinnamon-wayland:/home/ovidio-neto/.local/share/flatpak/exports/share:/var/lib/flatpak/exports/share:/usr/local/share:/usr/share"
declare -x XDG_GREETER_DATA_DIR="/var/lib/lightdm-data/ovidio-neto"
declare -x XDG_RUNTIME_DIR="/run/user/1000"
declare -x XDG_SEAT="seat0"
declare -x XDG_SEAT_PATH="/org/freedesktop/DisplayManager/Seat0"
declare -x XDG_SESSION_CLASS="user"
declare -x XDG_SESSION_DESKTOP="cinnamon-wayland"
declare -x XDG_SESSION_ID="c3"
declare -x XDG_SESSION_PATH="/org/freedesktop/DisplayManager/Session0"
declare -x XDG_SESSION_TYPE="wayland"
declare -x XDG_VTNR="8"
declare -x XMODIFIERS="@im=ibus"
