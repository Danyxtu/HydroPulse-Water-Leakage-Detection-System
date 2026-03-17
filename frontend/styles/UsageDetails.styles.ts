import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/themes';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: SIZES.radiusLarge,
    borderBottomRightRadius: SIZES.radiusLarge,
    padding: SIZES.padding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  appSub: {
    fontSize: 12,
    color: COLORS.textDark,
    opacity: 0.7,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMedium,
    marginHorizontal: SIZES.padding,
    padding: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  breakdownTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 16,
  },
  listContainer: {
    width: '100%',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  listItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  listLeft: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  listRight: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
  },
  listZone: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  listTime: {
    fontSize: 12,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  listDetail: {
    fontSize: 12,
    color: COLORS.textDark,
    fontWeight: '500',
  },
});
