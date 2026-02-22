import { Page, Text, View, Document, StyleSheet, Image, Link } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 72, // 1 inch approx
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: '#000',
        lineHeight: 1.6,
    },
    topBorder: {
        borderTopWidth: 2,
        borderTopColor: '#064e3b', // Dark emerald
        marginBottom: 15,
    },
    headerWrapper: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 15,
        marginBottom: 20,
        backgroundColor: '#f8fafc',
    },
    mainTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    sectionHeading: {
        fontSize: 11,
        fontWeight: 'bold',
        marginTop: 18,
        marginBottom: 10,
        color: '#1e293b',
        textAlign: 'left',
    },
    subSectionHeading: {
        fontSize: 10,
        fontWeight: 'bold',
        fontStyle: 'italic',
        marginTop: 12,
        marginBottom: 6,
        color: '#334155',
        textAlign: 'left',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    col: {
        flex: 1,
    },
    label: {
        fontWeight: 'bold',
    },
    listContainer: {
        marginTop: 5,
        marginBottom: 10,
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: 4,
        paddingLeft: 10,
    },
    bullet: {
        width: 10,
    },
    listText: {
        flex: 1,
        textAlign: 'left',
    },
    paragraph: {
        marginBottom: 10,
        textAlign: 'left',
    },
    italics: {
        fontStyle: 'italic',
    },
    table: {
        marginTop: 15,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#000',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        minHeight: 30,
    },
    tableHeaderRow: {
        backgroundColor: '#e6f3e6', // Soft green to keep original vibe but professional
    },
    tableCol: {
        padding: 4,
        borderRightWidth: 1,
        borderRightColor: '#000',
    },
    tableCellHeader: {
        fontWeight: 'bold',
        fontSize: 8,
        textAlign: 'center',
    },
    tableCell: {
        fontSize: 7,
    },
    mediaContainer: {
        marginTop: 5,
        marginBottom: 10,
        padding: 8,
        backgroundColor: '#f8fafc',
        borderRadius: 4,
        borderLeftWidth: 2,
        borderLeftColor: '#10b981',
    },
    classImage: {
        width: '100%',
        maxHeight: 200,
        objectFit: 'contain',
        marginTop: 10,
        marginBottom: 10,
        borderRadius: 4,
    },
    youtubeLink: {
        color: '#2563eb',
        textDecoration: 'underline',
        fontSize: 9,
    },
    footerContainer: {
        marginTop: 30,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        paddingTop: 10,
        textAlign: 'center',
        fontSize: 7,
        color: '#94a3b8',
    },
    // Formal Minimalist Class Design
    classCard: {
        marginBottom: 25,
        paddingBottom: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: '#e2e8f0',
    },
    classHeader: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#064e3b',
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    sectionBox: {
        marginBottom: 10,
        paddingTop: 5,
    },
    activityBlock: {
        marginTop: 6,
        paddingLeft: 10,
        borderLeftWidth: 1,
        borderLeftColor: '#f1f5f9',
    },
    sectionLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase',
        marginBottom: 4,
        letterSpacing: 0.5,
    }
});

const PlantillaETA = ({ data }) => {
    if (!data) return null;

    // Helper to render value based on type
    const renderContent = (key, value, isHeader = false) => {
        if (typeof value === 'string') {
            return (
                <View key={key} style={styles.sectionBox}>
                    {!isHeader && <Text style={styles.sectionHeading}>{key.toUpperCase()}</Text>}
                    <Text style={styles.paragraph}>{value}</Text>
                </View>
            );
        }

        if (Array.isArray(value)) {
            return (
                <View key={key} style={styles.section}>
                    {!isHeader && <Text style={styles.sectionHeading}>{key.toUpperCase()}</Text>}
                    {value.map((item, i) => {
                        if (typeof item === 'string') {
                            return (
                                <View key={i} style={styles.listItem}>
                                    <Text style={styles.bullet}>•</Text>
                                    <Text style={styles.listText}>{item}</Text>
                                </View>
                            );
                        }
                        // Handle objects in arrays (like classes)
                        return (
                            <View key={i} style={styles.classCard}>
                                {Object.entries(item).map(([subKey, subVal]) => (
                                    <View key={subKey} style={styles.sectionBox}>
                                        <Text style={styles.sectionLabel}>{subKey.toUpperCase()}</Text>
                                        <Text style={styles.paragraph}>{typeof subVal === 'string' ? subVal : JSON.stringify(subVal)}</Text>
                                    </View>
                                ))}
                            </View>
                        );
                    })}
                </View>
            );
        }

        if (typeof value === 'object' && value !== null) {
            return (
                <View key={key} style={[styles.section, isHeader ? styles.headerWrapper : {}]}>
                    {!isHeader && <Text style={styles.sectionHeading}>{key.toUpperCase()}</Text>}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {Object.entries(value).map(([subKey, subVal]) => (
                            <Text key={subKey} style={{ width: '50%', marginBottom: 5 }}>
                                <Text style={styles.label}>{subKey}:</Text> {String(subVal)}
                            </Text>
                        ))}
                    </View>
                </View>
            );
        }

        return null;
    };

    // Identify header and main content
    const entries = Object.entries(data);
    const headerEntry = entries.find(([k]) => k.toLowerCase().includes('encabezado'));
    const otherEntries = entries.filter(([k]) => !k.toLowerCase().includes('encabezado') && k !== 'tipo');

    return (
        <Document title={data.tipo || "Documento Generado"}>
            <Page size="A4" style={styles.page}>
                <View style={styles.topBorder} />

                {headerEntry ? (
                    renderContent(headerEntry[0], headerEntry[1], true)
                ) : (
                    <Text style={[styles.mainTitle, { textAlign: 'center' }]}>{data.tipo || "Documento"}</Text>
                )}

                {otherEntries.map(([key, value]) => renderContent(key, value))}

                <View style={styles.footerContainer}>
                    <Text>Documento generado por Maestro de Planificaciones | Basado en el Trayecto de Actualización Matemática</Text>
                </View>
            </Page>
        </Document>
    );
};

export default PlantillaETA;
