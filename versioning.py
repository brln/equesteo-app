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
    if line.strip().startswith('DISTRIBUTION'):
        sys.stdout.write('DISTRIBUTION={}\n'.format(newCode))
    elif line.strip().startswith('RELEASE'):
        sys.stdout.write('RELEASE="com.equesteo-{}"\n'.format(newName))
    else:
        sys.stdout.write(line)

for line in fileinput.input('./.env', inplace=True):
    if line.strip().startswith('DISTRIBUTION'):
        sys.stdout.write('DISTRIBUTION={}\n'.format(newCode))
    elif line.strip().startswith('RELEASE'):
        sys.stdout.write('RELEASE="com.equesteo-{}"\n'.format(newName))
    else:
        sys.stdout.write(line)
