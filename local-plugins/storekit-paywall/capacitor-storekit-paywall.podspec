require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name = package['name']
  s.version = package['version']
  s.summary = package['description']
  s.license = 'MIT'
  s.homepage = 'https://crowncare.app'
  s.author = package['author']
  s.source = { :git => '', :tag => s.version.to_s }
  s.source_files = 'ios/Plugin/**/*.{swift,h,m,c,cc,mm,cpp}', 'ios/PluginObjc/**/*.{swift,h,m,c,cc,mm,cpp}'
  s.ios.deployment_target  = '15.0'
  s.dependency 'Capacitor'
  s.swift_version = '5.1'
end
