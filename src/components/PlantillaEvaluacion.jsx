import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import Html from 'react-pdf-html';

const styles = StyleSheet.create({
    page: {
        padding: 50,
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: '#000',
        lineHeight: 1.5,
    },
    headerBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        paddingBottom: 10,
        marginBottom: 20,
    },
    schoolName: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    subjectTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 5,
    },
    studentInfo: {
        flexDirection: 'row',
        marginTop: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 10,
    },
    studentField: {
        flex: 1,
        fontSize: 9,
        fontWeight: 'bold',
    },
    dottedLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#cbd5e1',
        borderStyle: 'dotted',
        flex: 1,
        marginRight: 10,
        marginBottom: 2,
    },
    evalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 25,
        color: '#1e293b',
    },
    contentWrapper: {
        fontSize: 10,
    },
    footerContainer: {
        position: 'absolute',
        bottom: 30,
        left: 50,
        right: 50,
        borderTopWidth: 0.5,
        borderTopColor: '#e2e8f0',
        paddingTop: 10,
        textAlign: 'center',
        fontSize: 8,
        color: '#94a3b8',
    }
});

const PlantillaEvaluacion = ({ data, sequenceData }) => {
    // Return a placeholder document instead of null to prevent PDF renderer crashes
    if (!data || !sequenceData) {
        return (
            <Document title="Cargando...">
                <Page size="A4" style={styles.page}>
                    <Text>Cargando datos de evaluación...</Text>
                </Page>
            </Document>
        );
    }

    const encabezado = sequenceData.encabezado;

    return (
        <Document title={data.titulo || "Evaluación"}>
            <Page size="A4" style={styles.page}>
                {/* Academic Header */}
                <View style={styles.headerBorder}>
                    <Text style={styles.schoolName}>{encabezado.institucion}</Text>
                    <Text style={styles.subjectTitle}>{encabezado.materia}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 5, gap: 10 }}>
                        <Text style={{ fontSize: 9 }}>Docente: {encabezado.docente}</Text>
                        <Text style={{ fontSize: 9 }}>DNI: {encabezado.dni}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 2, gap: 10 }}>
                        <Text style={{ fontSize: 9 }}>Ciclo: {encabezado.ciclo}</Text>
                        <Text style={{ fontSize: 9 }}>Teléfono: {encabezado.telefono}</Text>
                    </View>
                </View>

                {/* Evaluation Title */}
                <Text style={styles.evalTitle}>{data.titulo}</Text>

                {/* Student Info Fields */}
                <View style={styles.studentInfo}>
                    <View style={{ flex: 2, flexDirection: 'row' }}>
                        <Text style={styles.studentField}>ALUMNO/A: </Text>
                        <View style={styles.dottedLine} />
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <Text style={styles.studentField}>CURSO: </Text>
                        <View style={styles.dottedLine} />
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <Text style={styles.studentField}>FECHA: </Text>
                        <View style={styles.dottedLine} />
                    </View>
                </View>

                {/* Content */}
                <View style={styles.contentWrapper}>
                    <Html stylesheet={{
                        h1: { fontSize: 10, fontWeight: 'bold', marginBottom: 10, marginTop: 15 },
                        h2: { fontSize: 9, fontWeight: 'bold', marginBottom: 8, marginTop: 12 },
                        p: { fontSize: 8, fontWeight: 'normal', marginBottom: 8, textAlign: 'justify', lineHeight: 1.3 },
                        ul: { marginBottom: 10, marginLeft: 15 },
                        li: { fontSize: 8, fontWeight: 'normal', marginBottom: 4, lineHeight: 1.3 },
                        div: { fontSize: 8, fontWeight: 'normal' },
                        span: { fontSize: 8, fontWeight: 'normal' },
                        strong: { fontWeight: 'bold' },
                        b: { fontWeight: 'bold' }
                    }}>
                        {data.contenido_html}
                    </Html>
                </View>

                {/* Footer */}
                <View style={styles.footerContainer}>
                    <Text>Maestro de Secuencias | Basado en el Trayecto de Actualización Matemática</Text>
                </View>
            </Page>
        </Document>
    );
};

export default PlantillaEvaluacion;
