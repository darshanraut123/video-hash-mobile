import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  box: {
    width: '100%', // Width of the box
    height: 100, // Height of the box
    borderRadius: 12, // Rounded corners
    borderWidth: 2, // Border thickness
    borderColor: '#007BFF', // Border color (blue)
    justifyContent: 'center', // Align content vertically
    alignItems: 'center', // Align content horizontally
    backgroundColor: '#F0F8FF', // Light background color
    marginTop: 50,
  },
  boxTxt: {
    fontSize: 10,
    color: 'red',
  },
  icon: {
    width: 50,
    height: 50,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#36454F',
    borderRadius: 25,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  confidenceBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confidenceText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  shareButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#007BFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  confidenceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#f9f9f9',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  tableValue: {
    fontSize: 14,
    color: '#666',
  },
});
