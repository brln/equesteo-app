#! /usr/bin/python

import fileinput
import sys

for line in fileinput.input('./android/app/src/main/AndroidManifest.xml'):
    if line.strip().startswith('android:versionCode'):
        print(line)
    elif line.strip().startswith('android:versionName'):
        print(line)
