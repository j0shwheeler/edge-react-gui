// @flow

import type { EdgeDenomination } from 'edge-core-js'
import * as React from 'react'
import { Image, StyleSheet, TouchableHighlight, View } from 'react-native'
import { Actions } from 'react-native-router-flux'

import { type WalletListMenuKey } from '../../actions/WalletListMenuActions.js'
import * as intl from '../../locales/intl.js'
import s from '../../locales/strings.js'
import T from '../../modules/UI/components/FormattedText/FormattedText.ui.js'
import { calculateWalletFiatBalanceWithoutState } from '../../modules/UI/selectors.js'
import { THEME } from '../../theme/variables/airbitz.js'
import { type GuiWallet } from '../../types/types.js'
import { scale, scaleH } from '../../util/scaling.js'
import * as UTILS from '../../util/utils'
import { ProgressPie } from './ProgressPie.js'
import { WalletListMenu } from './WalletListMenu.js'

type OwnProps = {
  parentId: string,
  sortHandlers: any,
  currencyCode: string,
  balance: string,
  walletFiatSymbol: string,
  showBalance: boolean,
  progress: number,
  executeWalletRowOption: (walletId: string, option: WalletListMenuKey, currencyCode?: string) => void
}

export type StateProps = {
  displayDenomination: EdgeDenomination,
  settings: Object,
  exchangeRates: Object,
  currencyCode: string,
  wallet: GuiWallet
}

export type DispatchProps = {
  selectWallet: (id: string, currencyCode: string) => any
}

type Props = OwnProps & StateProps & DispatchProps

export class WalletListTokenRow extends React.PureComponent<Props> {
  selectWallet = () => {
    const { parentId: walletId, currencyCode } = this.props
    this.props.selectWallet(walletId, currencyCode)
    Actions.transactionList({ params: 'walletList' })
  }

  render() {
    const { wallet, currencyCode, settings, exchangeRates, walletFiatSymbol, showBalance, progress } = this.props
    const { name } = wallet
    const meta = wallet.metaTokens.find(token => token.currencyCode === currencyCode)
    const symbolImage = meta ? meta.symbolImage : undefined
    const cryptoAmount = intl.formatNumber(UTILS.convertNativeToDisplay(this.props.displayDenomination.multiplier)(this.props.balance) || '0') // check if infinitesimal (would display as zero), cut off trailing zeroes
    const cryptoAmountString = showBalance ? cryptoAmount : ''
    const rateKey = `${currencyCode}_${wallet.isoFiatCurrencyCode}`
    const exchangeRate = exchangeRates[rateKey] ? exchangeRates[rateKey] : null
    // Fiat Balance Formatting
    const fiatBalance = calculateWalletFiatBalanceWithoutState(wallet, currencyCode, settings, exchangeRates)
    const fiatBalanceFormat = fiatBalance && parseFloat(fiatBalance) > 0.000001 ? fiatBalance : 0
    const fiatBalanceSymbol = showBalance && exchangeRate ? walletFiatSymbol : ''
    const fiatBalanceString = showBalance && exchangeRate ? fiatBalanceFormat : ''
    // Exhange Rate Formatting
    const exchangeRateFormat = exchangeRate ? intl.formatNumber(exchangeRate, { toFixed: 2 }) : null
    const exchangeRateFiatSymbol = exchangeRateFormat ? `${walletFiatSymbol} ` : ''
    const exchangeRateString = exchangeRateFormat ? `${exchangeRateFormat}/${currencyCode}` : s.strings.no_exchange_rate
    // Yesterdays Percentage Difference Formatting
    const yesterdayUsdExchangeRate = exchangeRates[`${currencyCode}_iso:USD_${UTILS.getYesterdayDateRoundDownHour()}`]
    const fiatExchangeRate = wallet.isoFiatCurrencyCode !== 'iso:USD' ? exchangeRates[`iso:USD_${wallet.isoFiatCurrencyCode}`] : 1
    const yesterdayExchangeRate = yesterdayUsdExchangeRate * fiatExchangeRate
    const differenceYesterday = exchangeRate ? exchangeRate - yesterdayExchangeRate : null
    let differencePercentage = differenceYesterday ? (differenceYesterday / yesterdayExchangeRate) * 100 : null
    if (!yesterdayExchangeRate) {
      differencePercentage = ''
    }
    let differencePercentageString, differencePercentageStringStyle
    if (!exchangeRate || !differencePercentage || isNaN(differencePercentage)) {
      differencePercentageStringStyle = styles.walletDetailsRowDifferenceNeutral
      differencePercentageString = ''
    } else if (exchangeRate && differencePercentage && differencePercentage === 0) {
      differencePercentageStringStyle = styles.walletDetailsRowDifferenceNeutral
      differencePercentageString = '0.00%'
    } else if (exchangeRate && differencePercentage && differencePercentage < 0) {
      differencePercentageStringStyle = styles.walletDetailsRowDifferenceNegative
      differencePercentageString = `- ${Math.abs(differencePercentage).toFixed(2)}%`
    } else if (exchangeRate && differencePercentage && differencePercentage > 0) {
      differencePercentageStringStyle = styles.walletDetailsRowDifferencePositive
      differencePercentageString = `+ ${Math.abs(differencePercentage).toFixed(2)}%`
    }

    return (
      <TouchableHighlight style={styles.tokenRowContainer} underlayColor={THEME.COLORS.ROW_PRESSED} delayLongPress={500} onPress={this.selectWallet}>
        <View style={styles.rowContent}>
          <View style={styles.rowIconWrap}>
            {symbolImage && <Image style={styles.rowCurrencyLogoAndroid} source={{ uri: symbolImage }} resizeMode="cover" />}
            <View style={styles.rowCurrencyLogoAndroid}>
              <ProgressPie size={rowCurrencyOverlaySize} color={THEME.COLORS.OPAQUE_WHITE_2} progress={progress} />
            </View>
          </View>
          <View style={styles.walletDetailsContainer}>
            <View style={styles.walletDetailsRow}>
              <T style={styles.walletDetailsRowCurrency}>{currencyCode}</T>
              <T style={styles.walletDetailsRowValue}>{cryptoAmountString}</T>
            </View>
            <View style={styles.walletDetailsRow}>
              <T style={styles.walletDetailsRowName}>{name}</T>
              <View style={styles.walletDetailsFiatBalanceRow}>
                <T style={styles.walletDetailsRowFiat}>{fiatBalanceSymbol}</T>
                <T style={styles.walletDetailsRowFiat}>{fiatBalanceString}</T>
              </View>
            </View>
            <View style={styles.walletDetailsRowLine} />
            <View style={styles.walletDetailsRow}>
              <View style={styles.walletDetailsExchangeRow}>
                <T style={styles.walletDetailsRowExchangeRate}>{exchangeRateFiatSymbol}</T>
                <T style={styles.walletDetailsRowExchangeRate}>{exchangeRateString}</T>
              </View>
              <T style={differencePercentageStringStyle}>{differencePercentageString}</T>
            </View>
          </View>
          <View style={styles.rowOptionsWrap}>
            <WalletListMenu
              currencyCode={currencyCode}
              currencyName={name}
              customStyles={customWalletListOptionsStyles}
              image={symbolImage}
              executeWalletRowOption={this.props.executeWalletRowOption}
              walletId={wallet.id}
              isToken
            />
          </View>
        </View>
      </TouchableHighlight>
    )
  }
}

const rowCurrencyOverlaySize = scale(23.3)
const customWalletListOptionsStyles = StyleSheet.create({
  icon: {
    fontSize: scale(21),
    fontWeight: '200',
    position: 'relative',
    top: 6
  },
  menuIconWrap: {
    width: scale(46),
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start'
  }
})
const rawStyles = {
  rowContent: {
    flex: 1,
    flexDirection: 'row'
  },
  rowIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: scale(36)
  },
  rowCurrencyLogoAndroid: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    bottom: 0,
    height: scale(23),
    width: scale(23),
    marginRight: scale(12),
    marginLeft: scale(3),
    resizeMode: 'contain',
    alignSelf: 'center'
  },
  rowOptionsWrap: {
    width: scaleH(37)
  },
  tokenRowContainer: {
    padding: scale(6),
    paddingLeft: scale(8),
    height: scale(106),
    backgroundColor: THEME.COLORS.GRAY_4,
    borderBottomWidth: 1,
    borderColor: THEME.COLORS.GRAY_3
  },
  walletDetailsContainer: {
    flex: 1,
    flexDirection: 'column',
    marginTop: scale(5)
  },
  walletDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  walletDetailsRowLine: {
    height: 1,
    borderColor: 'rgba(14, 75, 117, 0.5)',
    borderBottomWidth: 1,
    marginTop: scale(12),
    marginBottom: scale(9)
  },
  walletDetailsRowCurrency: {
    flex: 1,
    fontSize: scale(18)
  },
  walletDetailsRowValue: {
    textAlign: 'right',
    fontSize: scale(18),
    color: THEME.COLORS.GRAY_1
  },
  walletDetailsRowName: {
    flex: 1,
    fontSize: scale(14),
    color: THEME.COLORS.SECONDARY
  },
  walletDetailsRowFiat: {
    fontSize: scale(14),
    textAlign: 'right',
    color: THEME.COLORS.SECONDARY
  },
  walletDetailsRowExchangeRate: {
    fontSize: scale(14),
    textAlign: 'left',
    color: THEME.COLORS.GRAY_1
  },
  walletDetailsRowDifferenceNeutral: {
    fontSize: scale(14),
    textAlign: 'right',
    color: THEME.COLORS.SECONDARY
  },
  walletDetailsRowDifferencePositive: {
    fontSize: scale(14),
    textAlign: 'right',
    fontWeight: '400',
    color: THEME.COLORS.WALLET_LIST_DIFF_POSITIVE
  },
  walletDetailsRowDifferenceNegative: {
    fontSize: scale(14),
    textAlign: 'right',
    fontWeight: '400',
    color: THEME.COLORS.WALLET_LIST_DIFF_NEGATIVE
  },
  walletDetailsFiatBalanceRow: {
    flexDirection: 'row'
  },
  walletDetailsExchangeRow: {
    flexDirection: 'row',
    flex: 1
  }
}
const styles: typeof rawStyles = StyleSheet.create(rawStyles)
