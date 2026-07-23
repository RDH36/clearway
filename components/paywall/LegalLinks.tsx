import { Linking, Text, View } from 'react-native';
import { PressableScale } from 'pressto';
import { PRIVACY_URL, TERMS_URL } from '@/components/settings/actions';
import { fonts } from '@/constants/theme';

function Link({ label, url }: { label: string; url: string }) {
  return (
    <PressableScale onPress={() => Linking.openURL(url)} style={{ paddingVertical: 4, paddingHorizontal: 6 }}>
      <Text style={{ fontFamily: fonts.body, fontSize: 12, color: '#9FB2B1', textDecorationLine: 'underline' }}>
        {label}
      </Text>
    </PressableScale>
  );
}

export function LegalLinks() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
      <Link label="Terms of service" url={TERMS_URL} />
      <Text style={{ fontFamily: fonts.body, fontSize: 12, color: '#5C7375' }}>·</Text>
      <Link label="Privacy policy" url={PRIVACY_URL} />
    </View>
  );
}
