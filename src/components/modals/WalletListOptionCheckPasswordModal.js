// @flow

import * as React from 'react'
import { Text, View } from 'react-native'
import { TextField } from 'react-native-material-textfield'

import s from '../../locales/strings.js'
import { type Theme, type ThemeProps, cacheStyles, withTheme } from '../services/ThemeContext.js'
import { PrimaryButton, SecondaryButton } from '../themed/ThemedButtons.js'
import { ThemedModal } from '../themed/ThemedModal.js'
import { type AirshipBridge } from './modalParts.js'

type OwnProps = {
  bridge: AirshipBridge<string | null>,
  buttonLabel: string,
  checkPassword(password: string): Promise<boolean>,
  message: string,
  title: string,
  walletName?: string
}

type State = {
  input: string,
  error: string
}

type Props = OwnProps & ThemeProps

class WalletListOptionCheckPasswordModalComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      input: '',
      error: ''
    }
  }

  onInputChange = (input: string) => {
    this.setState({ input })
  }

  onSubmit = () => {
    const { bridge, checkPassword } = this.props
    checkPassword(this.state.input)
      .then(resolve => {
        resolve ? bridge.resolve(this.state.input) : this.setState({ error: s.strings.fragmet_invalid_password })
      })
      .catch(error => {
        console.log(error)
        this.setState({ error: s.strings.fragmet_invalid_password })
      })
  }

  render() {
    const { bridge, buttonLabel, message, theme, title, walletName } = this.props
    const styles = getStyles(theme)
    return (
      <ThemedModal bridge={bridge} onCancel={() => bridge.resolve(null)}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message.trim()}</Text>
          {walletName && <Text style={styles.walletName}>{walletName}</Text>}
          <TextField
            textColor={theme.primaryText}
            returnKeyType="go"
            tintColor={theme.primaryText}
            baseColor={theme.primaryText}
            errorColor={theme.dangerText}
            error={this.state.error}
            label={s.strings.confirm_password_text}
            onChangeText={this.onInputChange}
            value={this.state.input}
            containerStyle={styles.input}
            secureTextEntry
          />
        </View>
        <PrimaryButton label={buttonLabel} onPress={this.onSubmit} marginRem={[0.05, 0, 0.5, 0]} />
        <SecondaryButton label={s.strings.string_cancel_cap} onPress={() => bridge.resolve(null)} marginRem={[0.05, 0, 0.5, 0]} />
      </ThemedModal>
    )
  }
}

const getStyles = cacheStyles((theme: Theme) => ({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.rem(2)
  },
  icon: {
    left: theme.rem(0.125)
  },
  title: {
    color: theme.primaryText,
    fontSize: theme.rem(1.25),
    fontFamily: theme.fontFaceDefault,
    textAlign: 'center',
    margin: theme.rem(0.25)
  },
  message: {
    color: theme.primaryText,
    fontSize: theme.rem(1),
    textAlign: 'center',
    fontFamily: theme.fontFaceDefault,
    marginBottom: 0
  },
  walletName: {
    color: theme.primaryText,
    fontSize: theme.rem(1),
    textAlign: 'center',
    fontFamily: theme.fontFaceBold
  },
  input: {
    marginVertical: theme.rem(1)
  }
}))

export const WalletListOptionCheckPasswordModal = withTheme(WalletListOptionCheckPasswordModalComponent)
