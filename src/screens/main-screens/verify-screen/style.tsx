import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  noRecordsConyainer: {
    display: 'flex',
    alignItems: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  uploadBtn: {
    height: 50, // Height of the box
    width: '100%',
    borderRadius: 12, // Rounded corners
    borderWidth: 2, // Border thickness
    borderColor: '#007BFF', // Border color (blue)
    backgroundColor: '#007BFF', // Border color (blue)
    justifyContent: 'center', // Align content vertically
    alignItems: 'center', // Align content horizontally
    zIndex: 1,
    position: 'absolute',
    bottom: 20,
    left: 15,
  },
  btnTxt: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFF',
  },

  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    backgroundColor: 'black',
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 10,
    textAlign: 'center',
    color: 'black',
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
  canvasContainer: {
    backgroundColor: 'white',
    height: 32,
    width: 32,
    position: 'absolute',
    bottom: -100,
  },
  uploadTxt: {
    padding: 35,
    textAlign: 'center',
    flexWrap: 'wrap',
    lineHeight: 20,
  },

  sectionContainer: {
    marginVertical: 5,
    borderRadius: 5,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
  },
  value: {
    color: '#333',
  },
});
