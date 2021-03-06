#!/usr/local/bin/python3

import subprocess
import requests

getData = "/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I"
findLine = "grep BSSID"
getMacAddress = ['awk','{print $2}']

p1 = subprocess.Popen(getData.split(' '), stdout=subprocess.PIPE)
p2 = subprocess.Popen(findLine.split(' '), stdin=p1.stdout, stdout=subprocess.PIPE)
p3 = subprocess.Popen(getMacAddress, stdin=p2.stdout, stdout=subprocess.PIPE)
output, error = p3.communicate()
data = output[:-1].decode('utf-8')
pairs = data.split(':')
newList = []
for pair in pairs:
    if(len(pair) == 1):
        pair = '0'+pair
    newList.append(pair)
data = ':'.join(newList)

r = requests.post('http://localhost:8080/', data={'macAddress': data})
