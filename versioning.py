#! /usr/bin/python

import fileinput
import sys

newCode = sys.argv[1]
newName = sys.argv[2]

for line in fileinput.input('./android/app/src/main/AndroidManifest.xml', inplace=True):
    if line.strip().startswith('android:versionCode'):
        sys.stdout.write('    android:versionCode="{}"\n'.format(newCode))
    elif line.strip().startswith('android:versionName'):
        sys.stdout.write('    android:versionName="{}">\n'.format(newName))
    else:
        sys.stdout.write(line)


for line in fileinput.input('./android/app/build.gradle', inplace=True):
    if line.strip().startswith('versionCode '):
        sys.stdout.write('        versionCode {}\n'.format(newCode))
    elif line.strip().startswith('versionName '):
        sys.stdout.write('        versionName "{}"\n'.format(newName))
    else:
        sys.stdout.write(line)


for line in fileinput.input('./.env.production', inplace=True):
    if line.strip().startswith('distribution'):
        sys.stdout.write('distribution={}\n'.format(newCode))
    elif line.strip().startswith('release'):
        sys.stdout.write('release="com.equesteo-{}"\n'.format(newName))
    else:
        sys.stdout.write(line)

for line in fileinput.input('./.env', inplace=True):
    if line.strip().startswith('distribution'):
        sys.stdout.write('distribution={}\n'.format(newCode))
    elif line.strip().startswith('release'):
        sys.stdout.write('release="com.equesteo-{}"\n'.format(newName))
    else:
        sys.stdout.write(line)


next_is_short_version = False
next_is_bundle_version = False
for line in fileinput.input('./ios/equesteo/Info.plist', inplace=True):
    if not next_is_short_version and not next_is_bundle_version:
        sys.stdout.write(line)
    elif next_is_short_version:
        sys.stdout.write('       <string>{}</string>\n'.format(newName))
        next_is_short_version = False
    elif next_is_bundle_version:
        sys.stdout.write('       <string>{}</string>\n'.format(newCode))
        next_is_bundle_version = False

    if line.strip() == '<key>CFBundleShortVersionString</key>':
        next_is_short_version = True
    elif line.strip() == '<key>CFBundleVersion</key>':
        next_is_bundle_version = True


