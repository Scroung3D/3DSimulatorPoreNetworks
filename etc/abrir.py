import struct
import json

name = 'L20_xmb26_xms32_s6_cs10_nc10_f06_nt8_c_10001bat'
path = name + '.bin'
f = file(path,'rb')
f.seek(0,2)
fin = f.tell()
f.seek(0,0)

lizt = []

while (f.tell() < fin):
    s = f.read(16)
    dato = str(struct.unpack("f f f f", s))
    dato = dato.translate(None,'()\'')
    dato = dato.split(',')
    dato = [float(x) for x in dato]
    dato = [float('{:.2f}'.format(x)) for x in dato]
    lizt.append(dato)

L = int(path[ path.find('/L') + len('/L') : path.find('_xmb') ])
xmb = int(path[ path.find('_xmb') + len('_xmb') : path.find('_xms') ])
xms = int(path[ path.find('_xms') + len('_xms') : path.find('_s') ])
sigma = int(path[ path.find('_s') + len('_s') : path.find('_cs') ])

auxRadios = []
for e in lizt:
    auxRadios.append(e[0])
rmax = max(auxRadios)
interespacio = (rmax/100)*2*1.2

sitios = []
enlaces = []

cota = (( L-1 )/2.0) * interespacio

i = 0
x = -cota
while( x < cota or str(x) == str(cota) ):
    y = -cota
    while( y < cota or str(y) == str(cota)  ):
        z = -cota
        while( z < cota or str(z) == str(cota)  ):
            sitios.extend((round(x,2),round(y,2),round(z,2)))
            sitios.append(round(lizt[i][0]/100.0,2))
            sitios.append(0)
            if( lizt[i][0] <= (xms - 0.43*sigma) ):
                sitios.extend((0,1,1,1))
            elif( lizt[i][0] <= (xms + 0.43*sigma) ):
                sitios.extend((0,0,1,1))
            else:
                sitios.extend((1,0,0,1))

            enlaces.extend((round(x,2),round(y + interespacio/2.0,2),round(z,2)))
            enlaces.append(round(lizt[i][1]/100.0,2))
            enlaces.append(1)
            if( lizt[i][1] <= (xmb - 0.43*sigma) ):
                enlaces.extend((0,1,1,1))
            elif( lizt[i][1] <= (xmb + 0.43*sigma) ):
                enlaces.extend((0,0,1,1))
            else:
                enlaces.extend((1,0,0,1))

            enlaces.extend((round(x + interespacio/2.0,2),round(y,2),round(z,2)))
            enlaces.append(round(lizt[i][2]/100.0,2))
            enlaces.append(2)
            if( lizt[i][2] <= (xmb - 0.43*sigma) ):
                enlaces.extend((0,1,1,1))
            elif( lizt[i][2] <= (xmb + 0.43*sigma) ):
                enlaces.extend((0,0,1,1))
            else:
                enlaces.extend((1,0,0,1))

            enlaces.extend((round(x,2),round(y,2),round(z + interespacio/2.0,2)))
            enlaces.append(round(lizt[i][3]/100.0,2))
            enlaces.append(0)
            if( lizt[i][3] <= (xmb - 0.43*sigma) ):
                enlaces.extend((0,1,1,1))
            elif( lizt[i][3] <= (xmb + 0.43*sigma) ):
                enlaces.extend((0,0,1,1))
            else:
                enlaces.extend((1,0,0,1))

            i = i + 1
            z = z + interespacio
        y = y + interespacio
    x = x + interespacio

with open(name+ 'python' + '.json', 'w') as outfile:
    json.dump({'L': str(L), 'xmb': str(xmb),'xms': str(xms), 'sitios': sitios, 'enlaces': enlaces}, outfile)
